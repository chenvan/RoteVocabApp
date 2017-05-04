/**
 *app name:透析单词
 *author:陈旺
 *1.00 finish date:2016-10-20
 */

import React from 'react'
import { Provider } from 'react-redux'
import {
  AppRegistry,
  Navigator,
  BackAndroid
} from 'react-native'
import HomeScene from './lib/Components/HomeScene'
import SearchCoverImageScene from './lib/Components/SearchCoverImageScene'
import { configStore } from './lib/Action/Action'
import AddFile from './lib/Components/AddFile'
import PracticeScene from './lib/Components/PracticeScene'
import ShareScene from './lib/Components/ShareScene'

var store = configStore()

const RoteVocabApp = () => {
  return (
      <Provider store = {store}>
        <Navigator
          initialRoute = {{name: 'homeScene'}}
          renderScene = {(route, navigator) => {
            switch (route.name) {
              case 'homeScene':
                return <HomeScene navigator = {navigator} />
              case 'searchCoverImageScene':
                return <SearchCoverImageScene navigator = {navigator} information = {route.information}/>
              case 'practiceScene':
                return <PracticeScene navigator = {navigator} db = {route.db}/>
              case 'addFile':
                return <AddFile navigator = {navigator} />
              default:
                BackAndroid.exitApp()
            }
          }}
          configureScene={(route, routeStack) => Navigator.SceneConfigs.FadeAndroid}
        />
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
