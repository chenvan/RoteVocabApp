import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  Navigator,
  ToastAndroid,
  ScrollView,
  View,
  Alert,
  Image,
  TouchableOpacity,
  BackAndroid
} from 'react-native'

import RNFS from 'react-native-fs'
import ContentsToDb from './ContentsToDb'

var Promise = require('bluebird')

export default class DirView extends Component {
  constructor (props) {
    super(props)

    this.state = {
      state: 'init',
      ds: [],
      contents: null,
      routes: [{name: '主程序'}].concat(this.props.navigator.getCurrentRoutes())
    }

    this._DirViewBackPressHandler = this._DirViewBackPressHandler.bind(this)
  }

  _handleTrackPress (route, index) {
    if (index === 0) {
      this.props.mainNavigator.pop()
    } else {
      var length = this.state.routes.length
      this.props.navigator.popN(length - index - 1)
    }
  }

  _creatDirRoutes (value, index) {
    return (
      <View key={index} style={{justifyContent: 'center'}}>
        <Text
          style = {{fontSize: 20, margin: 5, color: 'white'}}
          onPress={this._handleTrackPress.bind(this, value, index)}
        >
          {value.name + ' >'}
        </Text>
      </View>
    )
  }

  render () {
    switch (this.state.state) {
      case 'init':
        return (
          <ActivityIndicator size="large" style={[styles.centering, {height: 80}]} />
        )
      case 'initDone':
        return (
          <View style={{flex: 1}}>
            <View style={{height: 56}}>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={true}
                  style={{backgroundColor: '#2196F3'}}
                >
                  {this.state.routes.map(this._creatDirRoutes.bind(this))}
                </ScrollView>
            </View>
            <FlatList
              data = {this.state.ds}
              renderItem = {({item}) => (
                <TouchableOpacity onPress={this._handlePress.bind(this, item)}>
                  <View style = {styles.dirItemView}>
                    <View style = {styles.imageView}>
                      {
                        item.isDirectory() ? (
                          <Image
                            source = {{uri: 'ic_folder_white_36dp'}}
                            style = {styles.imageShow}
                          />
                        ) : (
                          <Text style = {{
                            fontSize: 14,
                            color: 'white'
                          }}>
                            {catchFileFormat(item.name)}
                          </Text>
                        )
                      }
                    </View>
                    <View style = {styles.dirTextView}>
                      <Text
                        style={styles.dirTextShow}
                      >
                          {item.name}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor = {(item) => item.name}
            />
          </View>
        )
      case 'getData':
        return (
          <ContentsToDb
            navigator={this.props.navigator}
            contents={this.state.contents}
            filename={this.props.data.name}
          />
        )
      default:
    }
  }

  _handlePress (rowData) {
    this.props.navigator.push(rowData)
  }

  // Android后退键设置
  _DirViewBackPressHandler () {
    let currentRoutes = this.props.navigator.getCurrentRoutes().pop()

    if (currentRoutes.name === '内存卡') {
      this.props.mainNavigator.pop()
    } else {
      this.props.navigator.pop()
    }

    return true
  }

  componentDidMount () {
    if (this.props.data.isFile()) {
      // mp4,png,mp3这些格式的文件都是从这里进入
      // 读取视屏文件会退出
      // 应该加size的检查，小体积的视屏文件依然能够正确报错
      // 2M多的图片已经很吃力了，限制2M吧
      // ToastAndroid.show(this.props.data.path,ToastAndroid.SHORT);

      // ToastAndroid.show(''+this.props.data.size,ToastAndroid.SHORT);

      Promise.try(() => {
        // file not bigger than 2Mb
        if (this.props.data.size > 2097152) throw Error('文件大小不能超过2MB')
        return this.props.data
      }).then((value) => {
        return RNFS.readFile(value.path, 'utf8')
      }).then((contents) => {
        // ToastAndroid.show("read contents over", ToastAndroid.SHORT);
        this.setState({
          state: 'getData',
          contents: contents
        })
      }).catch((e) => {
        Alert.alert(
          '',
          '' + e,
          [
            {text: '确认', onPress: () => {}}
          ]
        )
        this.props.navigator.pop()
      })
    } else {
      // ToastAndroid.show("else",ToastAndroid.SHORT);
      RNFS.readDir(this.props.data.path).then((dirResults) => {
        let sortFun = (a, b) => {
          let NameA = a.name.toUpperCase()
          let NameB = b.name.toUpperCase()
          if (NameA > NameB) return 1
          if (NameA < NameB) return -1
          return 0
        }

        let dirArray = dirResults.filter((value) => value.isDirectory()).sort(sortFun)
        let fileArray = dirResults.filter((value) => value.isFile()).sort(sortFun)

        dirResults = dirArray.concat(fileArray)

        this.setState({
          state: 'initDone',
          // dataSource: this.state.dataSource.cloneWithRows(dirResults)
          ds: dirResults
        })
      }).catch((e) => {
        Alert.alert(
          '',
          '' + e,
          [
            {text: '确认', onPress: () => {}}
          ]
        )
        this.props.navigator.pop()
      })
    }

    BackAndroid.addEventListener('DirViewBackPress', this._DirViewBackPressHandler)
  }

  componentWillUnmount () {
    // ToastAndroid.show('in componentWillUnmount',ToastAndroid.SHORT)
    BackAndroid.removeEventListener('DirViewBackPress', this._DirViewBackPressHandler)
  }
}

function catchFileFormat (fileName) {
  let names = fileName.split('.')
  if (names.length > 2 || (names.length === 2 && names[0] !== '')) {
    return names[names.length - 1]
  } else {
    return '?'
  }
}

const styles = StyleSheet.create({
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8
  },
  dirItemView: {
    flex: 0,
    flexDirection: 'row',
    paddingVertical: 2
  },
  imageView: {
    marginLeft: 16,
    marginVertical: 3,
    height: 44,
    width: 44,
    borderRadius: 44 / 2,
    backgroundColor: '#388E3C',
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageShow: {
    width: 36,
    height: 36
  },
  dirTextShow: {
    fontSize: 16,
    marginLeft: 12,
    marginRight: 16
  },
  dirTextView: {
    flex: 1,
    borderBottomWidth: 1,
    justifyContent: 'center',
    borderColor: '#CFD8DC'
  }
})
