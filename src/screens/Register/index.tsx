import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { Alert, Keyboard, Modal, TouchableWithoutFeedback } from 'react-native'
import { Button } from '../../components/Form/Button'
import { CategorySelectButton } from '../../components/Form/CategorySelectButton'
import { InputForm } from '../../components/Form/InputForm'
import { TransactionTypeButton } from '../../components/Form/TransactionTypeButton'
import { CategorySelect } from '../CategorySelect'
import { Container, Header, Title, Form, Fields, TransactionsTypes } from './styles'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface FormData {
    name: string;
    amount: string;
}

const schema = Yup.object().shape({
    name: Yup.
        string().
        required('Nome é obrigatório'),
    amount: Yup
        .number().
        typeError('Informe um valor númerico').
        positive('O Valor não pode ser negativo')
});

export function Register() {
    const [transactionType, setTransactionType] = useState('');
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    const dataKey = '@gofinances:transactions';
    const [category, setCategory] = useState({
        key: 'category',
        name: 'Categoria'
    });

    const {
        control, handleSubmit, formState: { errors }
    } = useForm({
        resolver: yupResolver(schema)
    });

    function handleTransactionsTypeSelect(type: 'up' | 'down') {
        setTransactionType(type)
    }

    function handleCloseSelectCategoryModal() {
        setCategoryModalOpen(false)
    }

    function handleOpenSelectCategoryModal() {
        setCategoryModalOpen(true)
    }

    async function handleRegister(form: FormData) {
        if (!transactionType)
            return Alert.alert('Selecione o tipo de transação');

        if (category.key === 'category')
            return Alert.alert('Selecione a categoria');

        const data = {
            name: form.name,
            amount: form.amount,
            transactionType,
            category: category.key

        }
        try {
            await AsyncStorage.setItem(dataKey, JSON.stringify(data));
        } catch (error) {
            console.log(error);
            Alert.alert("Não foi possível salvar")
        }
    }

    useEffect(() => {
        async function loadData() {
            const data = await AsyncStorage.getItem(dataKey);
            console.log(JSON.parse(data!))
        }

        loadData();
    }, [])

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Container>
                <Header>
                    <Title>
                        Cadastro
                    </Title>
                </Header>

                <Form>
                    <Fields>
                        <InputForm
                            name="name"
                            control={control}
                            placeholder="Nome"
                            autoCapitalize="sentences"
                            autoCorrect={false}
                            error={errors.name && errors.name.message}
                        />
                        <InputForm
                            name="amount"
                            control={control}
                            placeholder="Preço"
                            keyboardType="numeric"
                            error={errors.amount && errors.amount.message}
                        />
                        <TransactionsTypes>
                            <TransactionTypeButton
                                type="up"
                                title="Income"
                                onPress={() => handleTransactionsTypeSelect('up')}
                                isActive={transactionType === 'up'}
                            />

                            <TransactionTypeButton
                                type="down"
                                title="Outcome"
                                onPress={() => handleTransactionsTypeSelect('down')}
                                isActive={transactionType === 'down'}
                            />
                        </TransactionsTypes>

                        <CategorySelectButton
                            title={category.name}
                            onPress={handleOpenSelectCategoryModal}
                        />
                    </Fields>
                    <Button title="Enviar"
                        onPress={handleSubmit(handleRegister)} />
                </Form>

                <Modal visible={categoryModalOpen}>
                    <CategorySelect
                        category={category}
                        setCategory={setCategory}
                        closeSelectCategory={handleCloseSelectCategoryModal}
                    />
                </Modal>
            </Container>
        </TouchableWithoutFeedback>
    )
}