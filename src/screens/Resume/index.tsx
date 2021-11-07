import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react'
import { HistoryCard } from '../../components/HistoryCard'
import { categories } from '../../utils/categories';
import { Container, Header, Title } from './styles'

interface TransactionData {
    type: 'positive' | 'negative';
    name: string;
    amount: string;
    category: string;
    date: string;
}

interface CategoryData {
    name: string;
    total: string;
}

export function Resume() {

    async function LoadData() {
        const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([])

        const dataKey = '@gofinances:transactions';
        const response = await AsyncStorage.getItem(dataKey);
        const responseFormatted = response ? JSON.parse(response) : [];

        const expensives = responseFormatted.filter((expensive: TransactionData) => expensive.type === 'negative');

        const totalByCategory: CategoryData[] = [];

        categories.forEach(category => {
            let categorySum = 0;

            expensives.forEach((expensive: TransactionData) => {
                if (expensive.category === category.key) {
                    categorySum += Number(expensive.amount);
                }
            });

            if (categorySum > 0) {
                const total = categorySum.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                })

                totalByCategory.push({
                    name: category.name,
                    total,
                });
            }
        })

        setTotalByCategories(totalByCategory)
    }

    useEffect(() => {
        LoadData()
    }, []);

    return (
        <Container>
            <Header>
                <Title>Resumo por categoria</Title>
            </Header>
            {
                totalByCategories.map(item => (
                    <HistoryCard
                        title={item.name}
                        amount={item.total}
                        color='red'
                    />
                ))
            }
        </Container>
    )
}