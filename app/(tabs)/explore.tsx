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

export default function NewsList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const getNews = async () => {
    try {
      setLoading(true); // Tampilkan loading
      const response = await axios.get(
        'https://newsapi.org/v2/top-headlines?country=us&apiKey=b67226388eca4095844c27e34188bd4b'
      );
      setArticles(response.data.articles);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Sembunyikan loading
    }
  };

  // Panggil saat halaman difokuskan (termasuk saat kembali ke halaman ini)
  useFocusEffect(
    useCallback(() => {
      getNews();
    }, [])
  );

  // Tampilan loading
  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-900`}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={tw`text-amber-500 mt-4 text-lg`}>Memuat berita...</Text>
      </View>
    );
  }

  // Tampilan konten utama
  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <Text style={tw`text-3xl font-bold p-4 text-center mt-11 text-amber-500`}>
        Berita Terbaru
      </Text>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.url}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('newsselengkapnya', { article: item })}
            style={tw`bg-gray-800 m-4 rounded-3xl overflow-hidden shadow-xl border border-amber-500`}
          >
            <Image source={{ uri: item.urlToImage }} style={tw`w-full h-48`} />
            <View style={tw`p-4`}>
              <Text style={tw`text-amber-500 font-bold text-lg mb-2`}>
                {item.title}
              </Text>
              <Text style={tw`text-amber-400`} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
