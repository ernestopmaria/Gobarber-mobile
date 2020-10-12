import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Container, Header, BackButtton , HeaderTitle, UserAvatar, ProvidersListContainer,
   ProvidersList,
   ProviderContainer, ProviderAvatar, ProviderName, Calendar, Title,
   OpenDatePickerButton,OpenDatePickerButtonText} from './styles';
import DateTimePicker from '@react-native-community/datetimepicker'
import Icon from 'react-native-vector-icons/Feather'
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';
import { string } from 'yup';
import { Platform } from 'react-native';


interface RouteParams {
  providerId: string;
}

export interface Provider{
  id:string;
  name:string;
  avatar_url:string;
}

export interface AvailabilityItem{
  hour:number;
  availability:boolean;
}


const CreateAppointment: React.FC =()=> {


  const {user} = useAuth();
  const route = useRoute();
  const routeParams= route.params as RouteParams;

  const[availability, setAvailability] =useState<AvailabilityItem[]>([]);
  const [showDatePicker, setShowDatePicker ] = useState(false)
  const[selectedDate, setSelectedDate] = useState(new Date());
  const[providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] =useState(routeParams.providerId);

  const {goBack}= useNavigation();

  useEffect(()=>{
    api.get('providers').then((response)=>{
      setProviders(response.data);
    }).then(response =>{
      setAvailability(response.data)
    });
  },[]);

  useEffect(()=>{
    api.get(`providers/${selectedProvider}/day-availability`,{
      params:{
        year:selectedDate.getFullYear(),
        month:selectedDate.getMonth() +1,
        day:selectedDate.getDate(),
      }
    })
  },[selectedDate])


  const navigateBack = useCallback(()=>{
    goBack();
  },[goBack]);

  const handleSelectProvider = useCallback((providerId: string)=>{
    setSelectedProvider(providerId)

  }, []);

  const handleToggleDatePicker = useCallback(()=>{
    setShowDatePicker((state) =>!state)
  },[]);

  const handleDateChanged = useCallback((event:any, date:Date | undefined)=>{
    if(Platform.OS === 'android'){
      setShowDatePicker(false)
    }
    if(date) {
      setSelectedDate(date)}
  },[])

  return <Container>
    <Header>
      <BackButtton onPress={navigateBack}>
        <Icon name="chevron-left" size={24} color ="#999591"/>
      </BackButtton>
      <HeaderTitle>
        Cabeleireiros
      </HeaderTitle>
      <UserAvatar source ={{uri:user.avatar_url}}/>
    </Header>

    <ProvidersListContainer>
    <ProvidersList
    horizontal
    showsHorizontalScrollIndicator={false}
    data={providers}
    keyExtractor ={provider =>provider.id}
    renderItem ={({item:provider})=>(
    <ProviderContainer onPress={()=>handleSelectProvider(provider.id)}
    selected ={provider.id === selectedProvider}>
      <ProviderAvatar source={{uri:provider.avatar_url}} />
    <ProviderName    selected ={provider.id === selectedProvider}>{provider.name}</ProviderName>
    </ProviderContainer>
    )}
    />
    </ProvidersListContainer>
    <Calendar>
      <Title>Escolha a data</Title>
      <OpenDatePickerButton onPress={handleToggleDatePicker} >
        <OpenDatePickerButtonText>Selecionar outra data</OpenDatePickerButtonText>
      </OpenDatePickerButton>
    {showDatePicker &&
    (<DateTimePicker mode="date"
    display="calendar"
    onChange ={handleDateChanged}
     //textColor= "#f4ede8"
    value ={selectedDate}/>
    )}
    </Calendar>

  </Container>
}


export default CreateAppointment;
