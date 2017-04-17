import React, { Component } from 'react'
import {
  Navigator
} from 'react-native'

import DirView from './DirView'
import RNFS from 'react-native-fs'

export default class AddFile extends Component {
  render () {
    return (
      <Navigator
        initialRoute={{name: '内存卡', path: RNFS.ExternalStorageDirectoryPath, isFile: () => false}}
        renderScene={(route, navigator) => {
          return (
            <DirView data={route} navigator={navigator} mainNavigator={this.props.navigator} />
          )
        }}
        configureScene={(route, routeStack) => Navigator.SceneConfigs.FadeAndroid}
      />
    )
  }
}
