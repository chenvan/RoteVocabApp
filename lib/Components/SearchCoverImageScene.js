import React, { Component } from 'react'
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Image,
  NetInfo,
  FlatList,
  ActivityIndicator,
  ToastAndroid,
  TouchableOpacity,
  BackAndroid
} from 'react-native'

import { rvDB, bookAPI } from '../rvAPI'
import { CustomImageButton } from './Button'
import { connect } from 'react-redux'
import { changeVocabListCoverUrl } from './../Action/Action'

class SearchCoverImageScene extends Component {
  constructor (props) {
    super(props)

    this.state = {
      searchInfo: this.props.information,
      fetchData: false,
      ds: [],
      deviceWidth: 360,
      deviceHeight: 560
    }

    this.isAcceptImage = false
    this._searchCoverImageSceneBackPressHandler = this._searchCoverImageSceneBackPressHandler.bind(this)
    this._netStateChangeHandler = this._netStateChangeHandler.bind(this)
    this._checkDeviceWidth = this._checkDeviceWidth.bind(this)
  }

  componentWillMount () {
    NetInfo.fetch().done((netConnetInfo) => {
      this.isAcceptImage = netConnetInfo === 'WIFI'
    })
  }

  componentDidMount () {
    // android后退键设置
    BackAndroid.addEventListener('searchCoverImageScene', this._searchCoverImageSceneBackPressHandler)
    NetInfo.addEventListener('change', this._netStateChangeHandler)
  }

  componentWillUnmount () {
    BackAndroid.removeEventListener('searchCoverImageScene', this._searchCoverImageSceneBackPressHandler)
    NetInfo.removeEventListener('change', this._netStateChangeHandler)
  }

  render () {
    return (
      <View onLayout = {this._checkDeviceWidth}>
        <View style={{
          flex: 0,
          height: 56,
          flexDirection: 'row',
          backgroundColor: '#2196F3',
          alignItems: 'center'
        }}>
          <CustomImageButton
            source={{uri: 'ic_arrow_back_white_36dp'}}
            onPress={this._cancel.bind(this)}
            style={{height: 36, width: 36, marginRight: 10, marginLeft: 5}}
          />
          <TextInput
            // 这不是一个好方法
            style = {{fontSize: 22, flex: 1, color: this.state.deviceHeight > this.state.deviceWidth ? 'white' : 'black'}}
            ref = {(textInput) => { this.textInput = textInput }}
            onChangeText = {(searchInfo) => this.setState({searchInfo})}
            value = {this.state.searchInfo}
            underlineColorAndroid = 'white'
            inlineImageLeft = 'ic_search_white_36dp'
            inlineImagePadding = {5}
            onSubmitEditing = {this._search.bind(this, this.state.searchInfo)}
            autoFocus = {true}
            returnKeyType = {'search'}
          />
        </View>
        {
          this.state.fetchData ? (
            <Text style={{fontSize: 22, textAlign: 'center', marginTop: 30}}>{'加载中...'}</Text>
          ) : (
            <FlatList
              data = {this.state.ds}
              // 这样写会只判断一次this.isAcceptImage吗？
              // 如果中途更改网络状态会如何？
              renderItem = { this.isAcceptImage ? ({item}) => (
                <TouchableOpacity onPress = {this._changeCoverUrl.bind(this, item.id, this.props.information)}>
                  <View>
                    <Image source = {{uri: item.image}} style = {{width: 80, height: 118}}/>
                  </View>
                </TouchableOpacity>
              ) : ({item}) => (
                <TouchableOpacity onPress = {this._changeCoverUrl.bind(this, item.id, this.props.information)}>
                  <View style={item.title === undefined ? {} : {
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderColor: '#90CAF9'
                  }}>
                    <Text style={{fontSize: 20, paddingLeft: 16, textAlignVertical: 'center'}}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor = {(item) => item.id}
              numColumns = {this.isAcceptImage ? Math.floor(this.state.deviceWidth / 90) : 1}
              columnWrapperStyle = {this.isAcceptImage && {justifyContent: 'space-around', marginVertical: 5}}
            />
          )
        }
      </View>
    )
  }

  _cancel () {
    this.props.navigator.pop()
  };

  _search (bookInfo) {
    this.setState({fetchData: true})

    bookAPI.getBookID(bookInfo, this.isAcceptImage, 100).then((marchBooks) => {
      if (marchBooks.count > 0) {
        // ToastAndroid.show(JSON.stringify(marchBooks.books), ToastAndroid.LONG)
        this.setState({
          fetchData: false,
          ds: marchBooks.books
        })
      } else {
        throw new Error('在豆瓣中没找到' + bookInfo + '相关内容，请换一个关键词')
      }
    }).catch((e) => {
      ToastAndroid.show('' + e, ToastAndroid.LONG)
      this.setState({
        fetchData: false,
        ds: []
      })
    })
  }

  _changeCoverUrl (doubanBookID, vocabListName) {
    this.setState({
      fetchData: true
    })

    this.props.changeVocabListCoverUrl(doubanBookID, vocabListName).then(() => {
      this._cancel()
    }).catch((e) => {
      ToastAndroid.show('' + e, ToastAndroid.SHORT)
      this.setState({
        fetchData: false
      })
    })
  }


  _searchCoverImageSceneBackPressHandler () {
    this._cancel()
  }

  _netStateChangeHandler (newNetStateInfo) {
    this.isAcceptImage = newNetStateInfo === 'wIFI'
  }

  _checkDeviceWidth ({nativeEvent: {layout: {width, height}}}) {
    // ToastAndroid.show('width: ' + e.nativeEvent.layout.width, ToastAndroid.SHORT)
    this.setState({
      deviceWidth: width,
      deviceHeight: height
    })
  }
}

var mapDispatchToProps = (dispatch) => {
  return {
    changeVocabListCoverUrl: (id, vocabListName) => dispatch(changeVocabListCoverUrl(id, vocabListName))
  }
}

export default connect(null, mapDispatchToProps)(SearchCoverImageScene)
