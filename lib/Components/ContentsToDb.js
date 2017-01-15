import React, { Component } from 'react';
import {
	StyleSheet,
	TextInput,
	View,
	Text,
	ActivityIndicator,
	Alert,
	ToastAndroid
} from 'react-native';

import {rvDB} from '../rvAPI';
import {CustomTextButton} from './Button';

export default class ContentsToDb extends Component {

	constructor(props) {
	  super(props);

	  const file = /([^.]+)\.(\w+)/.exec(this.props.filename);

	  //ToastAndroid.show('name: '+file[1]+' extension: '+file[2],ToastAndroid.SHORT);

	  this.state = {
	  	importing: false,
	  	modelName: file[1],
	  	fileExtension: file[2]
	  };
	}

	render() {
			return (
				this.state.importing ?
				//this.state.importing && <ActivityIndicator animating={this.state.importing} size="large" style={{marginTop:56}} />
				<Text style={{fontSize:22,textAlign:'center',marginTop:56}}>{'加载中...'}</Text>
				:
				<View>
					<Text style={{fontSize:20,margin:5}}>为这次导入的单词集取个名字</Text>
					<TextInput
							style={{fontSize:20, lineHeight: 40}}
							autoFocus={true}
							onChangeText={(text) => this.setState({modelName:text})}
							value={this.state.modelName}
					/>
					<View style={{flex:0,flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
						<CustomTextButton
							style = {styles.textButton}
							text = {'确认'}
							onPress = {this._store.bind(this, this.props.contents)}
						/>
						<CustomTextButton
							style = {styles.textButton}
							text = {'取消'}
							onPress = {()=>{this.props.navigator.pop()}}
						/>
					</View>
				</View>
			);
	}

	_store(contents) {

		if(this.state.modelName.length === 0){
			Alert.alert(
				'',
				'不能没有名字',
				[
					{text:'确认', onPress:()=>{}}
				]
			)
			this.setState({importing: false});
		}else{

			if(this.state.fileExtension === 'json'){

				var checkProperty = ['lastContentsLocation','bookmark','rows','totalLength'];

				rvDB.addJsonData(this.state.modelName, contents, checkProperty).then(()=>{
					ToastAndroid.show('JSON文件添加成功',ToastAndroid.SHORT);
					this.props.navigator.pop();
				}).catch((e)=>{

					Alert.alert(
						'',
						''+e,
						[
							{text:'确认', onPress:()=>{}}
						]
					)

					this.props.navigator.pop();
				})
			}
			else{
				rvDB.addData(this.state.modelName, contents, /^"(.+?)"$/gm).then((incressNum)=>{
					ToastAndroid.show("增加了"+incressNum+"词条",ToastAndroid.SHORT);
					this.props.navigator.pop();
				}).catch((e)=>{
					Alert.alert(
						'',
						''+e,
						[
							{text:'确认', onPress:()=>{}}
						]
					)
					this.props.navigator.pop();
				})
			}

			this.setState({importing: true});
		}
	}
}

const styles = StyleSheet.create({
  textButton: {
  	fontSize:21,
  	margin:5,
  	height:30
  }
});
