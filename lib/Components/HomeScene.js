
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ListView,
  DrawerLayoutAndroid,
  ToolbarAndroid,
  Navigator,
  View,
  ToastAndroid,
  Alert,
  TouchableOpacity,
  AsyncStorage,
  BackAndroid,
  StatusBar
} from 'react-native';

import DrawerView from './DrawerView';
import rvDB from '../rvDB';
import MultipleChoice from 'react-native-multiple-choice';
import RNFS from 'react-native-fs';

export default class HomeScene extends Component {
	constructor(props) {
	  super(props);
	  
	  const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

	  this.state = {
	  	state: 'home',
	  	data: this.props.db,
	  	dataSource: ds.cloneWithRows(this.props.db)
	  };

	  this.exportItems=[];
	  this.countTimer = 0;

	  this._homeSceneBackPressHandler = this._homeSceneBackPressHandler.bind(this);
	}

	
	render() {
		var homeView = (
			<ListView 
	         	dataSource={this.state.dataSource}
	         	enableEmptySections={true}
	         	style={{marginTop:8}}
	         	renderRow={(rowData) => 
	         		(
	         			<TouchableOpacity 
		         			onPress={this._handlePress.bind(this, rowData)} 
		         			onLongPress={this._delete.bind(this,rowData)}
		         		>	
		         			<View style={styles.itemContainer}>
			         			<Text 
			         				style={styles.itemText}
			         				numberOfLines={1}
			         			>{rowData}</Text>
		         			</View>
	         			</TouchableOpacity>
	         		)	
	         	}
	         />
		);

		if(this.state.state === 'exportWords'){
			//style的分布有问题
			homeView =(
				<View style={{flex:1}}>
					<MultipleChoice
						options={this.state.data}
						selectedOptions={[]}
						onSelection={(option)=>{
								var index;
								if((index = this.exportItems.indexOf(option)) == -1){
									this.exportItems.push(option);
								}else{
									this.exportItems.splice(index,1);
								}
								//ToastAndroid.show(JSON.stringify(this.exportItems),ToastAndroid.SHORT);
							}}
						style={{flex:14,marginTop:8}}
					/>
					<View style={{flex:2,flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
		      			<TouchableOpacity onPress={this._exportFile.bind(this)}>
			      			<View style={styles.textButtonView}>
				      			<Text style={styles.textButton}>导出</Text>
				      		</View>
				      	</TouchableOpacity>
			      		<TouchableOpacity onPress={this._cancelExportFile.bind(this)}>
				      		<View style={styles.textButtonView}>
				      			<Text style={styles.textButton}>取消</Text>
				      		</View>
				      	</TouchableOpacity>
				     </View>
			     </View>
			)
		}

	    return (
	    	<DrawerLayoutAndroid
		        ref={(drawer) => this.drawer = drawer}
		        drawerWidth={300}
		        drawerPosition={DrawerLayoutAndroid.positions.Left}
		        renderNavigationView={() => <DrawerView navigator={this.props.navigator} /> }
		    >
		    	<View style={styles.mainContainer}>
			    	<ToolbarAndroid
			            navIcon= {require('../PNG/menu.png')}
			            title="透析记词"
			            titleColor="white"
			            overflowIcon={require('../PNG/more_vert2.png')}
			            actions={[
			            	{title: '导入', show: 'never'},
			            	{title: '导出', show: 'never'}
			            ]}
			            style={styles.toolBar}
			            onActionSelected={(index) => {
			            		if(index == 0){
			            			this.props.navigator.push({name: "addFile"});
			            		}else if(index == 1){
			            			//ToastAndroid.show('导出',ToastAndroid.SHORT);
			            			this.setState({state:'exportWords'});
			            		}	
			            	}
			        	}
			            onIconClicked={() => this.drawer.openDrawer()}//没有反应
			         />
			        {homeView}
		        </View>
		    </DrawerLayoutAndroid>
	    );	
	}

	_handlePress(rowData){
		//ToastAndroid.show("in "+rowData,ToastAndroid.SHORT);
		this.props.navigator.push(
			{
				name: "practiceScene",
				db: rowData
			}
		)
	}

	_exportFile(){

		if(this.exportItems.length !== 0){
		      				  		
	  		var path = '/storage/emulated/0/透析记词';
  			
  			AsyncStorage.multiGet(this.exportItems).then((items)=>{
  				
  				//ToastAndroid.show(JSON.stringify(items),ToastAndroid.SHORT);
  				return RNFS.mkdir(path).then(()=>{
  					return items.map((value,index)=>{
  						return RNFS.writeFile(path+'/'+value[0]+'.json',value[1],'utf8');
  					});
	  				
  				}).then((results)=>{
  					ToastAndroid.show('导出到：'+path,ToastAndroid.SHORT);
	  				this.exportItems=[];
	  				this.setState({state:'home'});
  				});			  					      				  				
  			}).catch((e)=>{
	  			ToastAndroid.show('error:'+e,ToastAndroid.SHORT);
	  		});
	  	}
	}

	_cancelExportFile(){
		this.exportItems=[];
		this.setState({state:'home'});
	}

	_delete(rowData){
		
		Alert.alert(
			'',
			'删除'+rowData,
			[
				{text:'确认', onPress:()=>{

					rvDB.delectDataCollection(rowData).then(()=>{
						
						//this.state.dataSource不是array

						var data= this.state.data.slice();
						var index = data.indexOf(rowData);
						//ToastAndroid.show("data index: "+index,ToastAndroid.LONG);
						data.splice(index,1);
						//index即使是-1也能删除
						//ToastAndroid.show(""+JSON.stringify(data),ToastAndroid.LONG);
						//var data = this.props.db.slice();
						//ToastAndroid.show(""+JSON.stringify(this.props.db),ToastAndroid.LONG);

						this.setState({
							data: data,
							dataSource: this.state.dataSource.cloneWithRows(data)
						})
					}).catch((e)=>{
						ToastAndroid.show("error: "+e,ToastAndroid.SHORT);
					})
					
				}},
				{text:"取消", onPress:()=>{}}
			]
		)			

	}

	//返回建设置
	_homeSceneBackPressHandler(){
		
		var currentRoutes = this.props.navigator.getCurrentRoutes().pop();
		if(currentRoutes.name === 'drawerContentsScene'){
			this.props.navigator.pop();
			return true;
		}else if(currentRoutes.name === 'homeScene'){
			//弄成连续按两次退出
			//设置计数器，设时间，如果时间到，把计数器清零
			this.countTimer++;
			//ToastAndroid.show('in homeSceneBackPress -> countTimer: '+this.countTimer,ToastAndroid.SHORT);
			if(this.countTimer === 1){
				ToastAndroid.show('再按一次退出',ToastAndroid.SHORT);
				setTimeout(()=>{
					//ToastAndroid.show('Timeout',ToastAndroid.SHORT);
					this.countTimer = 0
				},1000);
			}else if(this.countTimer === 2){
				//ToastAndroid.show("in this.countTimer === 2",ToastAndroid.SHORT);
				return false
			}			
			return true;
		}else{
			return true;
		}
	}

	componentDidMount() {
		StatusBar.setBackgroundColor('#1976D2',true);
		//ToastAndroid.show('in componentDidMount',ToastAndroid.SHORT);
			
		//android后退键设置
		BackAndroid.addEventListener('homeSceneBackPress',this._homeSceneBackPressHandler);
	}

	componentWillUnmount(){
		//从DirView回到主程序，HomeScene会重新形成，这样homSeneBackPress就会有两个，返回键会出现诡异情况
		//ToastAndroid.show('in componentWillUnmount',ToastAndroid.SHORT);
		BackAndroid.removeEventListener('homeSceneBackPress',this._homeSceneBackPressHandler);
	}

}

const styles = StyleSheet.create({
  mainContainer: {
  	flex:1,
  	backgroundColor:"#F5F5F5"
  },
  itemContainer: {
    //alignItems: 'center',
    //justifyContent: 'center',
    //padding: 8,
    //borderWidth:1,
    //borderColor:'#90CAF9',
    paddingHorizontal: 16,
    height:54,
    //marginTop:10,
    //marginHorizontal:5,
    //borderRadius:7,
    backgroundColor:"#FFFFFF",
    flex:1,
    justifyContent:'center',
    borderBottomWidth:1,
    borderColor:"#90CAF9"
  },
  itemText:{
  	fontSize:21,
  	//lineHeight:48,
  	//marginLeft:5,
  	textAlignVertical:'center' 
  },
  toolBar: {
  	height:56,
  	backgroundColor: "#2196F3"
  },
  textButtonView: {
  	height:56,
  	width:56,
  	borderRadius:28,
  	backgroundColor:'#EF5350',
  	//alignItems: 'center'
  },
  textButton: {
  	fontSize:20,
  	//margin:5,
  	//height:50,
  	//width:50,
  	//borderRadius:25,
  	//textAlignVertical:'center',
  	marginTop:14,
  	marginLeft:7,
  	//borderWidth:1,
  	//borderColor:'black',
  	color:'white'
  }
});
