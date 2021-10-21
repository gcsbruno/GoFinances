import React from 'react'

import { Container, Title, Amount, Footer, Category, Icon, CategoryName, Date } from './styles'

export function TransactionCard() {
    return (
        <Container>
            <Title></Title>
            <Amount></Amount>
            <Footer>
                <Category>
                    <Icon name="dollar-sign"/>
                    <CategoryName>

                    </CategoryName>
                </Category>
                <Date></Date>
            </Footer>
        </Container>
    )
}