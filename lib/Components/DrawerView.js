import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ListView,
  View,
  ToastAndroid,
  Alert,
  Image,
  Linking,
  TouchableOpacity
} from 'react-native';

import {CustomTextButton} from './Button';

export default class DrawerView extends Component {

	constructor(props) {
	  super(props);

	  const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

	  this.state = {
	  	dataSource: ds.cloneWithRows([
	  		{name:'软件用法(流量警报)', url:"http://rollawang.com/2017/02/05/%E9%80%8F%E6%9E%90%E8%AE%B0%E8%AF%8D2-1-0%E7%94%A8%E6%B3%95%E6%8C%87%E5%8D%97/"},
	  		{name:'源码', url:"https://github.com/chenvan/RoteVocabApp/blob/master/README.md"},
	  		{name:'关于', url:"http://rollawang.com/AboutRoteVocabApp/"}
	  	])
	  }
	}

	render() {
		return (
			<View style={{flex: 1,backgroundColor: '#FAFAFA',}}>

    		<Image
    			source={require('../PNG/drawoutPic.png')}
    			style={
    				{height:200, width:300, resizeMode:"stretch"}
    			}
    		/>
    		<View style={styles.sloganView}>
    			<Text style={styles.sloganText}>透析原著学单词</Text>
    		</View>
      	<ListView
      		dataSource={this.state.dataSource}
					renderRow={ rowData =>

              <CustomTextButton
                style = {styles.textShow}
                text = {rowData.name}
                onPress = {this._handlePress.bind(this,rowData)}
              />

					}
				/>
			</View>
		);
	}

	_handlePress(rowData){

		Linking.openURL(rowData.url).catch((e)=>{
			ToastAndroid.show(''+e,ToastAndroid.SHORT);
		})
	}

}

const styles = StyleSheet.create({
	textShow: {
		fontSize: 21,
		marginLeft:20,
  		marginVertical:10,
	},
	sloganView: {
		borderBottomWidth:2,
		borderBottomColor:"#90CAF9",
	},
	sloganText: {
		fontSize:20,
		marginTop:10,
		marginBottom:15,
		textAlign:'center',
		opacity: 0.54
	}
})
