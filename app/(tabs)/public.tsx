import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import tw from 'twrnc';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function CatBreedList() {
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const getCatBreeds = async () => {
    try {
      setLoading(true); // tampilkan loading
      const response = await axios.get('https://api.thecatapi.com/v1/breeds');
      setBreeds(response.data);
    } catch (error) {
      console.error('Failed to fetch cat breeds:', error);
    } finally {
      setLoading(false); // sembunyikan loading
    }
  };

  useFocusEffect(
    useCallback(() => {
      getCatBreeds(); // fetch setiap halaman difokuskan
    }, [])
  );

  const renderItem = ({ item }) => {
    const imageUrl = item.reference_image_id
      ? `https://cdn2.thecatapi.com/images/${item.reference_image_id}.jpg`
      : 'https://cdn2.thecatapi.com/images/MTY3ODIyMQ.jpg';

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('CatDetail', { breed: item })}
        style={tw`bg-gray-800 m-4 rounded-3xl overflow-hidden shadow-xl border border-amber-500`}
      >
        <Image source={{ uri: imageUrl }} style={tw`w-full h-48`} />
        <View style={tw`p-4`}>
          <Text style={tw`text-amber-500 font-bold text-lg mb-1`}>
            {item.name}
          </Text>
          <Text style={tw`text-amber-400`} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-900`}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={tw`text-amber-500 mt-4 text-lg`}>Memuat data kucing...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <Text style={tw`text-3xl font-bold p-4 text-center mt-11 text-amber-500`}>
        Ras Kucing
      </Text>
      <FlatList
        data={breeds}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}
