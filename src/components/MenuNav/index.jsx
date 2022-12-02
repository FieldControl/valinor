import logo from '../../assets/logo.png'
import { AiOutlineBell } from 'react-icons/ai'
import {
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Stack,
  Img,
  Icon,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, AddIcon, ArrowDownIcon } from '@chakra-ui/icons';
import { InputComponent } from '../InputComponent';
import { useMediaQuery } from "@chakra-ui/react"

const NavLink = ({ children }) => (
    <Link
      px={2}
      py={1}
      color={'white'}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        color: 'gray.700',
        fontSize: 'bold'
      }}
      href={'#'}>
      {children}
    </Link>
  );

const Links = ['Pull requests', 'Issues', 'Codespaces', 'Marketplace', 'Explore'];

const LinksProfile = ['Your profile', 'Your repositories', 'Your organizations', 'Your enterprises', 'Your projects', 'Your stars', 'Your gists']


export const MenuNav = () => {

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile] = useMediaQuery("(max-width: 768px)") 

  return (
    <>
      <Box bg={useColorModeValue('gray.900', 'gray.900')} px={4} mb='5'>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <Img src={logo} alt='logo' h='32px'/>
            {isMobile ? null : <InputComponent/> }
            
            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}>
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            <Icon as={AiOutlineBell} color={'white'} mr={2}
            _hover={{ 
              color: 'gray.700',
              cursor: 'pointer'
            }}/>
            <Button
              variant={'solid'}
              bg={'none'}
              color={'white'}
              size={'xs'}
              mr={3}
              _hover={{
                color: 'gray.700'
              }
              }
              leftIcon={ <AddIcon />}>
              <ArrowDownIcon />
            </Button>
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}>
                <Avatar
                  size='sm'
                  src={
                    'https://yt3.ggpht.com/ytc/AMLnZu82yCgPSY0dJOZcqw7uwBAZj5Lps9Vmmx9JQ2pr=s900-c-k-c0x00ffffff-no-rj'
                  }
                />
              </MenuButton>
              <MenuList>
                {LinksProfile.map((link) => (
                  <MenuItem key={link} _hover={{
                    backgroundColor:'blue.700',
                    color: 'white'
                  }}>{link}</MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );

}