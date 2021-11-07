import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState, useCallback } from 'react'

import { useFocusEffect } from '@react-navigation/native'
import { HighlightCard } from '../../components/HighlightCard'
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard'

import {
    Container,
    Header,
    UserWrapper,
    UserInfo,
    Photo,
    User,
    UserGreeting,
    UserName,
    Icon,
    HighlightCards,
    Transactions,
    Title,
    TransactionList,
    LogoutButton,
    LoadContainer
} from './styles'
import { ActivityIndicator } from 'react-native'
import { useTheme } from 'styled-components'

export interface DataListProps extends TransactionCardProps {
    id: string
}
interface HightlightProps {
    amount: string
    lastTransaction: string;
}
interface HightlightData {
    entries: HightlightProps;
    expensives: HightlightProps;
    total: HightlightProps
}

export function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<DataListProps[]>([])
    const [hightlightData, setHighlightData] = useState<HightlightData>({} as HightlightData);

    const theme = useTheme();

    function getLastTransactionDate(
        collection: DataListProps[],
        type: 'positive' | 'negative'
    ) {
        const lastTransaction = new Date(
            Math.max.apply(Math, collection
                .filter(transaction => transaction.type === type)
                .map(transaction => new Date(transaction.date).getTime())));

        return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-BR', {month: 'long'})}`;
    }

    async function loadTransactions() {
        const dataKey = '@gofinances:transactions';
        const response = await AsyncStorage.getItem(dataKey);
        const transactions = response ? JSON.parse(response) : [];

        let entriesTotal = 0;
        let expensiveTotal = 0;

        const transactionsFormatted: DataListProps[] = transactions
            .map((item: DataListProps) => {

                if (item.type === 'positive') {
                    entriesTotal += Number(item.amount)
                } else {
                    expensiveTotal += Number(item.amount)
                }
                const amount = Number(item.amount).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });

                const date = Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                }).format(new Date(item.date))

                return {
                    id: item.id,
                    name: item.name,
                    amount,
                    type: item.type,
                    category: item.category,
                    date,
                }
            });

        setTransactions(transactionsFormatted);

        const lastTransactionsEntries = getLastTransactionDate(transactions, 'positive');
        const lastTransactionsExpensives = getLastTransactionDate(transactions, 'negative');
        const totalInterval = `01 a ${lastTransactionsExpensives}`;

        const total = entriesTotal - expensiveTotal;

        setHighlightData({
            entries: {
                amount: entriesTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: `Última entrada dia ${lastTransactionsEntries}`,
            },
            expensives: {
                amount: expensiveTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: `Última entrada dia ${lastTransactionsExpensives}`,
            },
            total: {
                amount: total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: totalInterval
            }
        });

        setIsLoading(false);
    }

    useEffect(() => {
        loadTransactions()
    }, [])

    useFocusEffect(useCallback(() => {
        loadTransactions();
    }, []))

    return (
        <Container>
            {isLoading ? <LoadContainer>
                <ActivityIndicator
                    color={theme.colors.primary}
                    size="large"
                />
            </LoadContainer> :
                <>
                    <Header>
                        <UserWrapper>
                            <UserInfo>
                                <Photo source={{ uri: 'https://avatars.githubusercontent.com/u/72214347?v=4' }} />
                                <User>
                                    <UserGreeting>Olá,</UserGreeting>
                                    <UserName>Bruno</UserName>
                                </User>
                            </UserInfo>
                            <LogoutButton onPress={() => { }}>
                                <Icon name="power" />
                            </LogoutButton>
                        </UserWrapper>
                    </Header>
                    <HighlightCards>
                        <HighlightCard
                            type="up"
                            title="Entradas"
                            amount={hightlightData.entries.amount}
                            lastTransaction={hightlightData.entries.lastTransaction}
                        />
                        <HighlightCard
                            type="down"
                            title="Saídas"
                            amount={hightlightData.expensives.amount}
                            lastTransaction={hightlightData.expensives.lastTransaction}
                        />
                        <HighlightCard
                            type="total"
                            title="Total"
                            amount={hightlightData.total.amount}
                            lastTransaction={hightlightData.total.lastTransaction}
                            />
                    </HighlightCards>

                    <Transactions>
                        <Title>
                            Listagem
                        </Title>
                        <TransactionList
                            data={transactions}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => <TransactionCard data={item} />}
                        />
                    </Transactions>
                </>
            }
        </Container>
    )
}