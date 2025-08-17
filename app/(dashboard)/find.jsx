import { StyleSheet, Text, SafeAreaView } from 'react-native'
import React from 'react'

export default function find() {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <Text  style={{ color:"white" }}>Find Donors</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingTop: 50,

  }
})