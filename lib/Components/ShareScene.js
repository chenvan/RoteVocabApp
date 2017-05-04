import React, { Component } from 'react'
import {
  ToastAndroid,
  StyleSheet,
  View,
  Text,
  Dimensions
} from 'react-native'

import ShareExtension from 'react-native-share-extension'
import ContentsToDb from './ContentsToDb'

export default class Share extends Component {
  constructor (props) {
    super(props)

    let { width } = Dimensions.get('window')

    if (width > 320) {
      width = (width - 320) / 3 + 320
    }

    this.state = {
      modelName: '',
      shareValue: '',
      isLoading: true,
      width
    }
  }

  async componentDidMount () {
    try {
      let { value } = await ShareExtension.data()
      // ToastAndroid.show(value, ToastAndroid.LONG)
      let modelName = ''

      let re = /([A-Za-z ]+)/
      let result = re.exec(value)
      if (result !== null) {
        modelName = result[1].trim()
        if (modelName.length > 35) {
          modelName = ''
        }
      }

      this.setState({
        modelName,
        shareValue: value,
        isLoading: false
      })
    } catch (e) {
      ToastAndroid.show('' + e, ToastAndroid.SHORT)
      ShareExtension.close()
    }
  }

  render () {
    return (
      <View style = {styles.container}>
        <View style = {[styles.mainView, {width: this.state.width}]}>
          <View style = {styles.topBar}>
            <Text style = {styles.appTitle}>
              {'透析记词'}
            </Text>
          </View>
          {
            this.state.isLoading ? (
              <Text style = {[styles.loadingTxt, styles.subView]}>
                {'加载中...'}
              </Text>
            ) : (
              <ContentsToDb
                exit = {() => ShareExtension.close()}
                filename = {this.state.modelName}
                contents = {this.state.shareValue}
                style = {styles.subView}
              />
            )
          }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(224, 224, 224, 0.6)'
  },
  mainView: {
    backgroundColor: 'white',
    elevation: 8,
    minHeight: 220
  },
  topBar: {
    flex: 0,
    height: 56,
    backgroundColor: '#2196F3',
    justifyContent: 'center'
  },
  appTitle: {
    color: 'white',
    fontSize: 22,
    marginLeft: 8
  },
  loadingTxt: {
    fontSize: 22,
    textAlign: 'center'
  },
  subView: {
    marginHorizontal: 8,
    marginVertical: 18
  }
})
