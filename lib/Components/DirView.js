import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  ToastAndroid,
  ScrollView,
  View,
  Alert,
  Image,
  TouchableOpacity,
  BackHandler
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
      contents: null
    }

    this._DirViewBackPressHandler = this._DirViewBackPressHandler.bind(this)
  }

  static navigationOptions = ({ navigation, screenProps }) => {
    // 在这里无法读取 this.props, this.state
    function creatDirRoutes (value, index) {
      return (
        <View key={index} style={{justifyContent: 'center'}}>
          <Text
            style = {{fontSize: 20, margin: 5, color: 'white'}}
            onPress={handleTrackPress.bind(this, value, index)}
          >
            {value + ' >'}
          </Text>
        </View>
      )
    }

    function handleTrackPress (routeName, index) {
      // HomeScence -> DirView_1(内存卡) -> DirView_2 -> DirView_3
      // 从 DirView_3 回到 HomeScence: goBack(keyOfDirView_1)
      // 此时 keys array 只需 DirView_1 和 DirView_2 的 key 就可以了  
      let routerArrayLength = navigation.state.params.names.length
      if (index < routerArrayLength - 2) {
        navigation.goBack(navigation.state.params.keys[index])
      } else if (index === routerArrayLength - 2) {
        navigation.goBack()
      }
    }
    
    return {
      header: (
        <View style={{height: 56}}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            style={{backgroundColor: '#2196F3'}}
          >
            {navigation.state.params.names.map(creatDirRoutes)}
          </ScrollView>
        </View>
      )
    }
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
            exit = {() => this.props.navigation.goBack()}
            contents = {this.state.contents}
            filename = {this.props.navigation.state.params.data.name}
          />
        )
      default:
    }
  }


  _handlePress (rowData) {
    let { navigate, state } = this.props.navigation
    navigate('DirView', {
      names: state.params.names.concat(rowData.name),
      keys: state.params.keys.concat(state.key),
      data: rowData
    })
  }

  // Android后退键设置
  _DirViewBackPressHandler () {
    let currentRoute = this.props.navigation.state.routeName
    if( currentRoute === 'DirView') {
      this.props.navigation.goBack()
      return true
    }
  }

  componentDidMount () {

    let { data } = this.props.navigation.state.params

    if (data.isFile()) {
      // mp4,png,mp3这些格式的文件都是从这里进入
      // 读取视屏文件会退出
      // 应该加size的检查，小体积的视屏文件依然能够正确报错
      // 2M多的图片已经很吃力了，限制2M吧
      // ToastAndroid.show(this.props.data.path,ToastAndroid.SHORT);

      // ToastAndroid.show(''+this.props.data.size,ToastAndroid.SHORT);

      Promise.try(() => {
        // file not bigger than 2Mb
        if (data.size > 2097152) throw Error('文件大小不能超过2MB')
        return data
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
        this.props.navigation.goBack()
      })
    } else {
      // ToastAndroid.show("else",ToastAndroid.SHORT);
      RNFS.readDir(data.path).then((dirResults) => {
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
        this.props.navigation.goBack()
      })
    }

    BackHandler.addEventListener('DirViewBackPress', this._DirViewBackPressHandler)
  }

  componentWillUnmount () {
    BackHandler.removeEventListener('DirViewBackPress', this._DirViewBackPressHandler)
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
