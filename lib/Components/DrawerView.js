import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ToastAndroid,
  Image,
  Linking,
  Modal,
  TouchableOpacity
} from 'react-native'

export default class DrawerView extends Component {
  constructor (props) {
    super(props)

    this.state = {
      modalVisible: false
    }
  }

  render () {
    return (
      <View style={{flex: 1, backgroundColor: '#FAFAFA'}}>
        <Modal
          animationType = 'slide'
          visible = {this.state.modalVisible}
          transparent={true}
          onRequestClose = {this._setModalVisible.bind(this, false)}
        >
          <AboutView onPress = {this._setModalVisible.bind(this, false)}/>
        </Modal>
        <Image
          source={require('../PNG/drawoutPic.png')}
          style={
            {height: 200, width: 300, resizeMode: 'stretch'}
          }
        />
        <View style={styles.sloganView}>
          <Text style={styles.sloganText}>透析原著学单词</Text>
        </View>
        <RowView
          name = '官网（内有使用指南）'
          source = {{uri: 'ic_home_black_24dp'}}
          onPress = {() => linkToWebSite('http://rollawang.com/roteVocab/')}
        />
        <RowView
          name = '源码'
          source = {{uri: 'ic_code_black_24dp'}}
          onPress = {() => linkToWebSite('https://github.com/chenvan/RoteVocabApp/blob/master/README.md')}
        />
        <RowView
          name = '关于'
          source = {{uri: 'ic_description_black_24dp'}}
          onPress = {this._setModalVisible.bind(this, true)}
        />
      </View>
    )
  }

  _setModalVisible (visible) {
    this.setState({modalVisible: visible})
  }
}

class RowView extends Component {
  render () {
    return (
      <TouchableOpacity onPress = {this.props.onPress}>
        <View
          style = {{
            flex: 0,
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 10
          }}
        >
          <Image
            source = {this.props.source}
            style = {{
              height: 30,
              width: 30,
              marginLeft: 8
            }}
          />
          <Text
            style = {{
              fontSize: 22,
              marginLeft: 16,
              opacity: 0.69
            }}
          >
            {this.props.name}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}

class AboutView extends Component {
  render () {
    return (
      <View
        style = {{
          flex: 1,
          alignItems: 'center',
          paddingTop: 56,
          backgroundColor: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <Image
          source = {require('../PNG/author.png')}
          style = {{
            height: 100,
            width: 100,
            borderRadius: 50
          }}
        />
        <Text style = {styles.aboutViewText}>
          {'AWang'}
        </Text>
        <Image
          source = {{uri: 'ic_email_black_36dp'}}
          style = {{
            height: 50,
            width: 50
          }}
        />
        <TouchableOpacity onPress = {() => linkToWebSite('mailto:van1989@foxmail.com')}>
          <Text style = {styles.aboutViewText}>
            {'点击发送邮件给作者'}
          </Text>
        </TouchableOpacity>
        <Image
          source = {{uri: 'ic_bug_report_black_36dp'}}
          style = {{
            height: 50,
            width: 50
          }}
        />
        <TouchableOpacity onPress = {() => linkToWebSite('http://www.coolapk.com/apk/com.rotevocabapp')}>
          <Text style = {styles.aboutViewText}>
            {'点击前往酷安透析记词评论区'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress = {this.props.onPress}
          style = {{
            alignSelf: 'flex-end',
            marginRight: 16,
            marginTop: 50
          }}
        >
          <Text
            style = {{
              borderWidth: 1,
              paddingVertical: 10,
              paddingHorizontal: 20,
              fontSize: 20,
              backgroundColor: '#2196F3',
              borderColor: '#2196F3',
              color: 'white'
            }}
          >
          {'返回'}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
}

function linkToWebSite (url) {
  Linking.openURL(url).catch((e) => {
    ToastAndroid.show('' + e, ToastAndroid.SHORT)
  })
}

const styles = StyleSheet.create({
  textShow: {
    fontSize: 21,
    marginLeft: 20,
    marginVertical: 10
  },
  sloganView: {
    borderBottomWidth: 2,
    borderBottomColor: '#90CAF9'
  },
  sloganText: {
    fontSize: 20,
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
    opacity: 0.54
  },
  aboutViewText: {
    fontSize: 20,
    marginBottom: 20
  }
})
