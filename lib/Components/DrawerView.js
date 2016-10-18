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

//import

export default class DrawerView extends Component {
	
	constructor(props) {
	  super(props);

	  const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

	  this.state = {
	  	dataSource: ds.cloneWithRows([
	  		{name:'软件用法',		url:"http://rollawang.com"},
	  		{name:'本人的透析之旅',	url:"http://rollawang.com"},
	  		{name:'关于作者',		url:"http://rollawang.com"},
	  		{name:'源码',			url:"http://rollawang.com"}
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
          			//图片四周有留白
          		/>
          		<View style={styles.sloganView}>
          			<Text style={styles.sloganText}>透析原著学单词</Text>
          		</View>	
	          	<ListView
	          		dataSource={this.state.dataSource}
					renderRow={(rowData) => 
						(
							<View>
								<TouchableOpacity onPress={this._handlePress.bind(this,rowData)}>
									<Text style={styles.textShow}>{rowData.name}</Text>
								</TouchableOpacity>
							</View>
						)
					}
				/>
			</View>
		);
	}

	_handlePress(rowData){
		/*this.props.navigator.push({
			name: "drawerContentsScene",
			drawerContents: rowData 
		})*/
		Linking.openURL(rowData.url).catch((e)=>{
			ToastAndroid.show(''+e,ToastAndroid.SHORT);
		})

	}

}

const styles = StyleSheet.create({
	textShow: {
		fontSize: 22,
		marginLeft:10,
  		marginVertical:15,
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