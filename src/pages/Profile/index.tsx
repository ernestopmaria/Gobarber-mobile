import React, {useRef, useCallback} from 'react';
import {ScrollView, KeyboardAvoidingView, Platform, View, TextInput, Alert} from 'react-native';
import *as Yup from 'yup';
import api from '../../services/api';
import {useNavigation} from '@react-navigation/native';
import {Form} from '@unform/mobile';
import {FormHandles} from '@unform/core';
import Icon from 'react-native-vector-icons/Feather'

import Input from '../../components/Input/index';
import Button from '../../components/Button/index';
import getValidationErrors from '../../utils/getValidationErrors';

import {Container, BackButton, Title, UserAvatarButton, UserAvatar} from './styles';
import { useAuth } from '../../hooks/auth';

interface SignUpFormData{
name:string;
email:string;
password:string;
}

const SignUp : React.FC =()=>{
const {user} = useAuth()

  const formRef = useRef<FormHandles>(null);
  const navigation = useNavigation();

  const emailInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const handleGoBack = useCallback(()=>{
    navigation.goBack();
  }, [navigation]);

  const handleSignUp = useCallback(
    async (data: SignUpFormData) => {
      try {
        formRef.current?.setErrors({});
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigátorio'),
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um e-mail valido'),
          password: Yup.string().min(6, 'No minimo 6 digitos'),
        });
        await schema.validate(data, { abortEarly: false });

        await api.post('/users', data);
        Alert.alert('Cadastro realizado com sucesso!',
         'Você ja pode fazer login na aplicação')
        navigation.goBack();


      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
          return;
        }
        Alert.alert('Erro no Cadastro', 'Ocorreu um erro ao fazer o cadastro, tente novamente');
      }
    },
    [navigation],
  );

  return(
    <>
    <KeyboardAvoidingView style={{ flex:1}}
     behavior={Platform.OS == 'ios' ? "padding" : undefined} enabled>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle ={{flex:1}}>
      <Container>
        <BackButton onPress={handleGoBack}>
          <Icon name= "chevron-left" size ={24} color = "#999591" />
        </BackButton>
        <UserAvatarButton onPress={()=>{}}>
          <UserAvatar source ={{uri:user.avatar_url}} />
        </UserAvatarButton>

        <View>

        <Title>Meu Perfil</Title>
        </View>
        <Form ref={formRef} onSubmit ={handleSignUp} >

        <Input autoCapitalize = "words" name="name" icon="user" placeholder="Nome"
         returnKeyType = "next"
         onSubmitEditing ={()=>{
           emailInputRef.current?.focus()
         }}/>

        <Input
        ref ={emailInputRef}
        keyboardType="email-address"
        autoCorrect={false} autoCapitalize ="none"
        name="email" icon="mail" placeholder="E-mail"
        returnKeyType = "next"
        onSubmitEditing ={()=>{
          oldPasswordInputRef.current?.focus()
        }}/>


        <Input
        ref ={oldPasswordInputRef}
        secureTextEntry name="old_password" icon="lock"
        textContentType="newPassword" placeholder="Senha actual"
        returnKeyType ="next"
        containerStyle ={{marginTop:16}}
        onSubmitEditing ={()=>{
          passwordInputRef.current?.focus()}}/>

      <Input
        ref ={passwordInputRef}
        secureTextEntry name="password" icon="lock"
        textContentType="newPassword" placeholder="Nova senha"
        returnKeyType ="next" onSubmitEditing ={()=>{
          confirmPasswordInputRef.current?.focus()}}/>

      <Input
        ref ={confirmPasswordInputRef}
        secureTextEntry name="password_confirmation" icon="lock"
        textContentType="newPassword" placeholder="Confirmar senha"
        returnKeyType ="send" onSubmitEditing ={()=>formRef.current?.submitForm()}/>
        </Form>
        <Button onPress={()=>formRef.current?.submitForm()}>Confirmar mudanças</Button>


      </Container>
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  )
}

export default SignUp;
