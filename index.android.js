/**
 *app name:透析单词
 *author:陈旺
 *1.00 finish date:2016-10-20
 */

import React from 'react'
import { Provider } from 'react-redux'
import {
  AppRegistry
} from 'react-native'
import { StackNavigator } from 'react-navigation'
import HomeScene from './lib/Components/HomeScene'
import SearchCoverImageScene from './lib/Components/SearchCoverImageScene'
import { configStore } from './lib/Action/Action'
import DirView from './lib/Components/DirView'
import PracticeScene from './lib/Components/PracticeScene'
import ShareScene from './lib/Components/ShareScene'

var store = configStore()

const AppNavigator = StackNavigator({
  HomeScene: {
    screen: HomeScene
  },
  SearchCoverImageScene: {
    screen: SearchCoverImageScene
  },
  PracticeScene: {
    screen: PracticeScene
  },
  DirView: {
    screen: DirView
  }
})

const RoteVocabApp = () => {
  return (
      <Provider store = {store}>
        <AppNavigator />
      </Provider>
  )
}

const Share = () => {
  return (
    <Provider store = {store}>
      <ShareScene />
    </Provider>
  )
}

AppRegistry.registerComponent('RoteVocabApp', () => RoteVocabApp)
AppRegistry.registerComponent('RoteVocabAppShare', () => Share)
