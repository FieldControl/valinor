import { Box, Flex, Grid, VStack } from '@chakra-ui/react'
import { Card } from '../../components/Card'
import { CategoryAside } from '../../components/CategoryAside'
import { LanguageAside } from '../../components/LanguageAside'
import { MenuNav } from '../../components/MenuNav'
import { useMediaQuery } from "@chakra-ui/react"
import { InputComponent } from '../../components/InputComponent'
import {SelectLanguage} from '../../components/SelectLanguage'
import { SelectCategory } from '../../components/SelectCategory'

export const Search = () => {
    const [isTablet] = useMediaQuery("(max-width: 768px)")
    return (
        <>
         <MenuNav />
         {isTablet ? <InputComponent/> : null}
         <Flex justify='center' direction={['column', 'column', 'row']}>
             <Flex direction='column'ml='10%' m='5'>
                
                {isTablet ? <SelectCategory/> : <CategoryAside />}
                {isTablet ? <SelectLanguage/> : <LanguageAside/>}
             </Flex>
            <Card/>
          
         </Flex>
         
         
        </>
       
    )
}