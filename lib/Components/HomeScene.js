import React, { Component } from 'react'
import { connect } from 'react-redux'

import CustomImage from './CustomImage'
import { CustomImageButton } from './Button'
import DrawerView from './DrawerView'
import { rvDB } from './../rvAPI'
import RNFS from 'react-native-fs'

import {
  initApp,
  deleteVocabListFromCollection,
  giveVocabListANewName
} from './../Action/Action'

import {
  StyleSheet,
  View,
  Text,
  ListView,
  ToastAndroid,
  ToolbarAndroid,
  TouchableOpacity,
  StatusBar,
  DrawerLayoutAndroid,
  ActivityIndicator,
  Alert,
  BackHandler
} from 'react-native'

class HomeScene extends Component {
  constructor (props) {
    super(props)

    const dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => {
      if (this.forceRenderListView) {
        return true
      }

      return r1 !== r2
    }})

    this.state = {
      isEditState: false,
      trigger: false,
      dataSource
    }

    this.selectList = []
    this.forceRenderListView = false
    this.countNumber = 0

    this._pressBackButton = this._pressBackButton.bind(this)
    this._changeEditState = this._changeEditState.bind(this)
    this._clearSelectItem = this._clearSelectItem.bind(this)
    this._deleteSelectItem = this._deleteSelectItem.bind(this)
    this._exportSelectItem = this._exportSelectItem.bind(this)
    this._enterDirView = this._enterDirView.bind(this)
    this._selectAllItem = this._selectAllItem.bind(this)
  }

  static navigationOptions = {
    header: null
  }

  componentWillMount () {
    this.props.initApp()
  }

  componentWillReceiveProps (newProps) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(newProps.data)
    })
  }

  componentDidMount () {
    StatusBar.setBackgroundColor('#1976D2', true)

    BackHandler.addEventListener('pressBackButtonInApp', this._pressBackButton)
  }

  componentDidUpdate () {
    if (this.forceRenderListView === true) {
      this.forceRenderListView = false
    }
  }

  componentWillUnmount () {
    BackHandler.removeEventListener('pressBackButtonInApp', this._pressBackButton)
  }

  render () {
    // ToastAndroid.show(''+this.props.init,ToastAndroid.SHORT);
    // this.props.init first undefined and then true, final false
    if (this.props.init) {
      return (
        <View style = {{flex: 1, justifyContent: 'center'}}>
          <ActivityIndicator size = 'large' />
        </View>
      )
    } else {
      return (
        <DrawerLayoutAndroid
          ref={(drawer) => { this.drawer = drawer }}
          drawerWidth={300}
          drawerPosition={DrawerLayoutAndroid.positions.Left}
          renderNavigationView={() => <DrawerView /> }
          onDrawerClose={() => { this.drawerStateOpen = false }}
          onDrawerOpen={() => { this.drawerStateOpen = true }}
          drawerLockMode = {this.state.isEditState ? 'locked-closed' : 'unlocked'}
        >
          <View style = {styles.mainContainer}>
            <CustomToolBar
              isEditState = {this.state.isEditState}
              selectListLength = {this.selectList.length.toString()}
              changeEditState = {this._changeEditState}
              exportSelectItem = {this._exportSelectItem}
              deleteSelectItem = {this._deleteSelectItem}
              selectAllItem = {this._selectAllItem}
              clearSelectItem = {this._clearSelectItem}
              enterDirView = {this._enterDirView}
              openDrawer = {() => this.drawer.openDrawer()}
            />
            <ListView
                dataSource = {this.state.dataSource}
                style = {{marginTop: 8}}
                renderRow = {(rowData, sectionID, rowID) => {
                  return (
                    <VocabListView
                      coverUrl = {rowData}
                      listName = {rowID}
                      pressList = {pressList.call(this, rowID)}
                      longPressList = {longPressList.call(this, rowID)}
                      longPressCover = {longPressCover.call(this, rowID)}
                      selectList = {this.selectList}
                      editState = {this.state.isEditState}
                    />
                  )
                }}
             />
         </View>
       </DrawerLayoutAndroid>
      )
    }
  }

  _enterDirView () {
    this.props.navigation.navigate('DirView', {
      names: ['主程序', '内存卡'],
      keys: [],
      data: {
        name: '内存卡',
        path: RNFS.ExternalStorageDirectoryPath,
        isFile: () => false
      }
    })
  }

  _changeEditState (toState, listName) {
    if (toState === true) {
      this.selectList = [listName]
      StatusBar.setBackgroundColor('#C2185B', true)
    } else {
      this.selectList = []
      StatusBar.setBackgroundColor('#1976D2', true)
    }

    this.forceRenderListView = true

    this.setState({
      isEditState: toState,
      dataSource: this.state.dataSource.cloneWithRows(this.props.data)
    })
  }

  _selectAllItem () {
    // this.prevSelectList = this.selectList.slice();
    this.selectList = Object.keys(this.props.data)
    this.forceRenderListView = true

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.props.data)
    })
  }

  _clearSelectItem () {
    this.selectList = []
    this.forceRenderListView = true

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.props.data)
    })
  }

  _deleteSelectItem () {
    if (this.selectList.length === 0) {
      ToastAndroid.show('没有选中任何词集', ToastAndroid.SHORT)
    } else {
      Alert.alert(
        '',
        '删除选中词集?',
        [
          {
            text: '确认',
            onPress: () => {
              this.props.deleteVocabListFromCollection(this.selectList).then(() => {
                this.selectList = []
                this.setState({
                  trigger: !this.state.trigger
                })

                ToastAndroid.show('删除成功', ToastAndroid.SHORT)
              })
            }
          },
          {
            text: '取消',
            onPress: () => {}
          }
        ]
      )
    }
  }

  _exportSelectItem () {
    if (this.selectList.length === 0) {
      ToastAndroid.show('没有选中任何词集', ToastAndroid.SHORT)
    } else {
      rvDB.exportJSONData(this.selectList).then((path) => {
        this._clearSelectItem()
        ToastAndroid.show('导出到：' + path, ToastAndroid.SHORT)
      }).catch((e) => {
        ToastAndroid.show('export error:' + e, ToastAndroid.SHORT)
      })
    }
  }

  _pressBackButton () {
    let currentRoute = this.props.navigation.state.routeName

    if (currentRoute === 'HomeScene') {
      if (this.drawerStateOpen) {
        // drawer is in open state
        this.drawer.closeDrawer()
      } else if (this.state.isEditState && this.selectList.length === 0) {
        this._changeEditState(false)
      } else if (this.state.isEditState && this.selectList.length > 0) {
        this._clearSelectItem()
      } else {
        // 弄成连续按两次退出
        // 设置计数器，设时间，如果时间到，把计数器清零
        this.countNumber++
        // ToastAndroid.show('' + this.countNumber, ToastAndroid.SHORT)
        if (this.countNumber === 1) {
          ToastAndroid.show('再按一次退出', ToastAndroid.SHORT)
          setTimeout(() => {
            this.countNumber = 0
          }, 1000)
        } else if (this.countNumber > 1) {
          return false
        }
      }
      return true
    } else {
      return true
    }
  }
}

function pressList (listName) {
  let that = this

  return function () {
    if (that.state.isEditState) {
      let index = that.selectList.indexOf(listName)
      if (index === -1) {
        that.selectList.push(listName)
        this.setState({
          backgroundColor: '#BDBDBD'
        })
      } else {
        that.selectList.splice(index, 1)
        this.setState({
          backgroundColor: 'white'
        })
      }

      that.setState({
        trigger: !that.state.trigger
      })
    } else {
      that.props.navigation.navigate('PracticeScene', {db: listName})
    }
  }
}

function longPressList (listName) {
  let that = this
  return function () {
    if (!that.state.isEditState) {
      that._changeEditState(true, listName)
    }
  }
}

function longPressCover (listName) {
  let that = this

  return function () {
    if (!that.state.isEditState) {
      that.props.navigation.navigate('SearchCoverImageScene', {information: listName})
    }
  }
}

class VocabListView extends Component {
  constructor (props) {
    super(props)

    this.state = {
      backgroundColor: 'white',
      borderColor: '#90CAF9'
    }
  }

  componentWillReceiveProps (newProps) {
    if (newProps.editState) {
      this.setState({
        borderColor: '#F48FB1'
      })
    } else {
      this.setState({
        borderColor: '#90CAF9'
      })
    }

    if (newProps.selectList.indexOf(this.props.listName) !== -1) {
      this.setState({
        backgroundColor: '#BDBDBD'
      })
    } else {
      this.setState({
        backgroundColor: 'white'
      })
    }
  }

  render () {
    return (
      <TouchableOpacity onPress = {this.props.pressList.bind(this)} onLongPress = {this.props.longPressList.bind(this)}>
        <View style = {[styles.itemContainer, {backgroundColor: this.state.backgroundColor, borderColor: this.state.borderColor}]}>
          <CustomImage
            inSelectState = {this.props.editState}
            url = {this.props.coverUrl}
            style = {{width: 67, height: 97}}
            onLongPress = {this.props.longPressCover.bind(this)}
          />
          <Text
            style={styles.itemText}
            numberOfLines = {2}
            ellipsizeMode = {'tail'}
          >{this.props.listName}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}

class CustomToolBar extends Component {
  render () {
    if (this.props.isEditState) {
      return (
        <ToolbarAndroid
          navIcon = {{uri: 'ic_arrow_back_white_36dp'}}
          overflowIcon = {{uri: 'ic_more_vert_white_36dp'}}
          actions = {[
            {title: '导出', icon: {uri: 'ic_file_upload_white_36dp'}, show: 'always'},
            {title: '删除', icon: {uri: 'ic_delete_forever_white_36dp'}, show: 'always'},
            {title: '全选', show: 'never'},
            {title: '清除所选', show: 'never'}
          ]}
          title = {this.props.selectListLength}
          titleColor = 'white'
          onIconClicked = {() => this.props.changeEditState(false)}
          onActionSelected = {(position) => {
            switch (position) {
              case 0:
                return this.props.exportSelectItem()
              case 1:
                return this.props.deleteSelectItem()
              case 2:
                return this.props.selectAllItem()
              case 3:
                return this.props.clearSelectItem()
            }
          }}
          style = {styles.toolBar}
        />
      )
    } else {
      return (
        <View style = {{flex: 0, height: 56, flexDirection: 'row', backgroundColor: '#2196F3', alignItems: 'center', justifyContent: 'space-between'}}>
          <View style = {{flex: 0, flexDirection: 'row', alignItems: 'center', marginLeft: 12}}>
            <CustomImageButton
              source = {{uri: 'ic_menu_white_36dp'}}
              style = {{height: 36, width: 36}}
              onPress = {this.props.openDrawer}
            />
          <Text style = {{color: 'white', fontSize: 22, marginLeft: 8}}>{'透析记词'}</Text>
          </View>
          <CustomImageButton
            source = {{uri: 'ic_add_circle_white_36dp'}}
            onPress = {this.props.enterDirView}
            style = {{height: 36, width: 36, marginRight: 12}}
          />
        </View>
      )
    }
  }
}

var mapStateToProps = (state) => {
  return {
    init: state.init,
    data: state.data
  }
}

var mapDispatchToProps = (dispatch) => {
  return {
    initApp: () => dispatch(initApp()),
    deleteVocabListFromCollection: (vocabListArray) => dispatch(deleteVocabListFromCollection(vocabListArray)),
    giveVocabListANewName: (vocabListName, nextVocabListName) => dispatch(giveVocabListANewName(vocabListName, nextVocabListName))
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  toolBar: {
    height: 56,
    backgroundColor: '#E91E63'
  },
  itemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 3,
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderBottomWidth: 1
  },
  itemText: {
    flex: 1,
    paddingLeft: 16,
    fontSize: 21,
    textAlignVertical: 'center'
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeScene)
