import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ListView,
  ActivityIndicator,
  Navigator,
  ToastAndroid,
  ScrollView,
  View,
  Alert,
  Image,
  TouchableOpacity,
  BackAndroid
} from 'react-native';

var Promise = require("bluebird");

import RNFS from 'react-native-fs';
import ContentsToDb from './ContentsToDb';

export default class DirView extends Component {
	constructor(props) {
	  super(props);
	  
	  const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); 
	  
	  this.state = {
	  	state:"init",
	  	dataSource: ds.cloneWithRows([]),
	  	contents: null,
	  	routes: [{name:"主程序"}].concat(this.props.navigator.getCurrentRoutes())
	  };

	  this._DirViewBackPressHandler = this._DirViewBackPressHandler.bind(this);
	}

	  _handleTrackPress(route,index) {
	  	
	  	if(index === 0){
	  		this.props.mainNavigator.popToTop();
	  	}else{
	  		var length = this.state.routes.length;
	  		this.props.navigator.popN(length-index-1);
	  	}
	  }

	  _creatDirRoutes(value, index){
	    	return (
	    		<View key={index} style={{justifyContent:"center"}}>
	    			<Text style = {{fontSize:20,margin:5,color:"white"}}
	    				  onPress={this._handleTrackPress.bind(this,value,index)}
	    			>{value.name+" >"}</Text>
	    		</View>
	    	);
	    }

	render() {
				
		switch(this.state.state){
			case "init":
				return (
			      <ActivityIndicator size="large" style={[styles.centering, {height: 80}]} />
			    );
			case "initDone":
				return (
					<View style={{flex:1}}>
						<View style={{height: 56}}>
			          		<ScrollView
					          horizontal={true}
					          showsHorizontalScrollIndicator={true}
					          style={{backgroundColor:'#2196F3'}}
					        >
					          {this.state.routes.map(this._creatDirRoutes.bind(this))}
					        </ScrollView>
					    </View>
						<ListView
							dataSource={this.state.dataSource}
							enableEmptySections={true}
							renderRow={(rowData) => 
								{
									
									var hasImage = <View style={{marginLeft:4}}></View>
									if(rowData.isDirectory()){
										var hasImage = (
											<View style={styles.imageView}>
												<Image
													source={{uri:'ic_folder_white_36dp'}}
													style={styles.imageShow}
												/>
											</View>
										);
									}

									return (
										<TouchableOpacity onPress={this._handlePress.bind(this,rowData)}>
											<View style={styles.dirItemView}>
												{hasImage}
												<Text 
													style={styles.dirTextShow}
													numberOfLines={1}
												>
													{rowData.name}
												</Text>
											</View>
										</TouchableOpacity>
									);
								}
							}
						/>
					</View>
				);
			case "getData":
				return (
					<ContentsToDb navigator={this.props.navigator} contents={this.state.contents} filename={this.props.data.name}/>
				);
			default:
		}
	}

	_handlePress(rowData){
		this.props.navigator.push(rowData);
	}

	//Android后退键设置
	_DirViewBackPressHandler(){
		var currentRoutes = this.props.navigator.getCurrentRoutes().pop();
    	//var mainCurrentRoutes = this.props.navgator.getCurrentRoutes.pop();
    	//ToastAndroid.show('in DirView',ToastAndroid.SHORT);
    	if(currentRoutes.name === '内存卡'){
    		this.props.mainNavigator.popToTop();
    	}else{
    		this.props.navigator.pop();
    	}
    	
    	return true;
	}

	componentDidMount(){


		if(this.props.data.isFile()){
	      //mp4,png,mp3这些格式的文件都是从这里进入
	      //读取视屏文件会退出
	      //加一检查文件后缀的方法？
	      //应该加size的检查，小体积的视屏文件依然能够正确报错
	      //限制5M左右？
	      //2M多的图片已经很吃力了，限制2M吧
	      //把检查size也放在promisevs
	      //ToastAndroid.show(this.props.data.path,ToastAndroid.SHORT);
	      
	      //ToastAndroid.show(''+this.props.data.size,ToastAndroid.SHORT);
	      
	      Promise.try(()=>{
	      	//file not bigger than 2Mb
	      	if(this.props.data.size > 2097152) throw new Error('文件大小不能超过2MB');
	      	return this.props.data;
	      
	      }).then((value)=>{
	      	
	      	return RNFS.readFile(value.path,'utf8')
	      
	      }).then((contents) => {
				//ToastAndroid.show("read contents over", ToastAndroid.SHORT);	       
		    	this.setState({
		    		state: "getData",
		    		contents: contents
		    	});
	        
	      }).catch((e) => {
	        Alert.alert(
				'',
				''+e,
				[
					{text:'确认', onPress:()=>{}}
				]
			)
			this.props.navigator.pop();
	      });

	    }else{
 		  
 		  //ToastAndroid.show("else",ToastAndroid.SHORT);
	      
	      RNFS.readDir(this.props.data.path).then((dirResults) => {
	        
	        var sortFun = (a,b)=>{
	        	var NameA = a.name.toUpperCase();
	        	var NameB = b.name.toUpperCase();
	        	if(NameA > NameB) return 1;
	        	if(NameA < NameB) return -1;
	        	return 0;
	        }
	        
	        var dirArray = dirResults.filter((value)=> value.isDirectory()).sort(sortFun);	        
	        var fileArray = dirResults.filter((value)=> value.isFile()).sort(sortFun);
	        
	        dirResults=dirArray.concat(fileArray);

	        this.setState({
	        	state: "initDone",
	        	dataSource: this.state.dataSource.cloneWithRows(dirResults)
	        });

	      }).catch((e) => {
	        Alert.alert(
				'',
				''+e,
				[
					{text:'确认', onPress:()=>{}}
				]
			)
			this.props.navigator.pop();
	      });
	    }
	    
	    BackAndroid.addEventListener('DirViewBackPress', this._DirViewBackPressHandler);
	 }

	 componentWillUnmount(){
	 	//ToastAndroid.show('in componentWillUnmount',ToastAndroid.SHORT);
	 	BackAndroid.removeEventListener('DirViewBackPress', this._DirViewBackPressHandler);
	 }
}

const styles = StyleSheet.create({
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  dirItemView:{
  	flex:0,
  	flexDirection:'row',
  	borderBottomWidth:1,
  	borderColor:'#90CAF9',
  	alignItems: "center"
  },
  imageView:{
  	marginLeft:16,
  	height:44,
  	width: 44,
  	borderRadius: 44/2,
  	backgroundColor: "#9E9E9E"
  },
  imageShow:{
  	marginLeft:4,//图片像素36
  	marginTop:4,
  	width:36,
  	height:36
  },
  dirTextShow:{
  	fontSize:20,
  	marginLeft:12,
  	marginRight:16,
  	marginVertical:10
  }
});