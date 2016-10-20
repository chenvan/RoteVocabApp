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

import rvDB from '../rvDB';

export default class ContentsToDb extends Component {
	
	constructor(props) {
	  super(props);
	
	  const file = /([^.]+)\.(\w+)/.exec(this.props.filename);

	  //ToastAndroid.show('name: '+file[1]+' extension: '+file[2],ToastAndroid.SHORT); 

	  this.state = {
	  	state: "checkName",
	  	modelName: file[1],
	  	fileExtension: file[2]
	  };
	}

	render() {
		switch(this.state.state) {
			case "checkName":
				return (
					<View>
						<Text style={{fontSize:20,margin:5}}>为这次导入的单词集取个名字</Text>
						<TextInput
		        			style={{fontSize:20, lineHeight: 40, borderColor: 'gray', borderWidth: 1}}
		        			autoFocus={true}
		        			onChangeText={(text) => this.setState({modelName:text})}
		        			value={this.state.modelName}
		      			/>
		      			<View style={{flex:1,flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
			      			<Text style={styles.textButton}
			      				  onPress={this._store.bind(this, this.props.contents)} 
			      		    >
			      				确认
			      			</Text>
			      			<Text style={styles.textButton}
			      				  onPress={()=>{this.props.navigator.pop()}} 
			      		    >
			      				取消
			      			</Text>
			      		</View>
	      			</View>
				);
			case "progress":
				return <ActivityIndicator size="large" style={[styles.centering, {height: 80}]} />
			default:
		}
			
	
	}

	_store(contents) {

		this.setState({doing: "progress"});
		if(this.state.modelName.length === 0){
			Alert.alert(
				'',
				'不能没有名字',
				[
					{text:'确认', onPress:()=>{}}
				]
			)
			this.setState({state: "checkName"});
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
			
			
		}	
	}
}

const styles = StyleSheet.create({
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  textButton: {
  	fontSize:20,
  	margin:5,
  	height:30
  }
});