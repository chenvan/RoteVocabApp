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
  TouchableWithoutFeedback,
  AsyncStorage,
  BackAndroid,
  StatusBar,
  Image,
  Modal,
} from 'react-native';

import DrawerView from './DrawerView';
import {rvDB} from '../rvAPI';
import RNFS from 'react-native-fs';
import CustomImage from './CustomImage';
import {CircleButton, CustomButton} from './Button';

export default class HomeScene extends Component {
	constructor(props) {
	  super(props);

	  const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1.value !== r2.value || r1.mark !== r2.mark});

	  let dataChange = Object.keys(this.props.db).map((currentValue) => {
	  	return {
	  		value: currentValue,
	  		mark: null
	  	};
	  });

	  this.state = {
	  	state: 'home',
	  	modalVisible: false,
	  	data: dataChange,
	  	dataSource: ds.cloneWithRows(dataChange)
	  };

	  this.countTimer = 0;
	  this.drawerStateOpen = false;
	  this.selectItems = []

	  this._homeSceneBackPressHandler = this._homeSceneBackPressHandler.bind(this);
	}

  componentDidMount() {
    //ToastAndroid.show(''+Object.keys(this.props.db),ToastAndroid.SHORT);
    //ToastAndroid.show(''+JSON.stringify(this.props.db),ToastAndroid.LONG);

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

	render() {

	    return (
	    	<DrawerLayoutAndroid
	        ref={(drawer) => this.drawer = drawer}
	        drawerWidth={300}
	        drawerPosition={DrawerLayoutAndroid.positions.Left}
	        renderNavigationView={() => <DrawerView /> }
	    	  onDrawerClose={() => this.drawerStateOpen = false}
	    	  onDrawerOpen={()=> this.drawerStateOpen = true}
		    >
		    	<View style={styles.mainContainer}>
			    	<Modal
						      animationType={"slide"}
	          			transparent={true}
	          			visible={this.state.modalVisible}
	          			onRequestClose={()=>{}}
					  >
  						<View style={{flex:1}}>

  							<TouchableWithoutFeedback onPress={()=>{this.setState({modalVisible: false})}}>

                  <View style={{flex:1,justifyContent: 'flex-end',alignItems: 'center'}}>

                    <View style={{backgroundColor:'#757575',width:220}}>
                      <CustomButton
                        onPress = {this._selectAllItems.bind(this)}
                        text = {'全选'}
                        style = {[styles.selectOption,{borderBottomWidth:1,borderColor:'#9E9E9E'}]}
                      />
                      <CustomButton
                        onPress = {this._clearAllSelectItems.bind(this)}
                        text = {'清空所选'}
                        style = {styles.selectOption}
                      />
  									</View>

  								</View>

  							</TouchableWithoutFeedback>

  						</View>
					  </Modal>

			    	<ToolbarAndroid
		          navIcon= {{uri:'ic_menu_white_36dp'}}
		          title = "透析记词"
		          titleColor = "white"
		          actions = {[
		            	         {title: '导入', icon:{uri:'ic_add_circle_white_36dp'}, show: 'always'}
		                    ]}
		          style = {styles.toolBar}
		          onActionSelected = {(index) => {
                		            		if(index == 0){
                		            			this.props.navigator.push({name: "addFile"});
                		            		}
                		              }}
		          onIconClicked = {() => this.drawer.openDrawer()}
			      />
              <View style = {{flex:1}}>
      					<ListView
      						dataSource = {this.state.dataSource}
      	         	enableEmptySections = {true}
      	         	style = {{marginTop:8}}
      	         	renderRow = {(rowData, sectionID, rowID) =>
                  	         		(
                                  // sectionID:s1 ;rowID 0,1,2...
                  	         			<TouchableOpacity
                  		         			onPress = {
                                                this.state.state === 'select' ?
                                                this._handleSelect.bind(this, rowData, rowID) : this._handlePress.bind(this, rowData, rowID)
                                              }
                  		         			onLongPress = {
                                                    this.state.state === 'select' ?
                                                    ()=>{this.setState({modalVisible: true})} : this._enterSelect.bind(this)
                                                  }
                  		         		>
                  		         				<View style={rowData.mark? styles.itemContainerInSelect : styles.itemContainer}>
                                        <CustomImage
                                          url= {this.props.db[rowData.value]}
                                          style= {styles.bookCover}
                                          onLongPress = {
                                                          this.state.state === 'select' ?
                                                          null : this._enterSearchCoverImageScene.bind(this, rowData)
                                                        }
                                        />
                                        <Text
                  				         				style={styles.itemText}
                                          numberOfLines={2}
                                          ellipsizeMode={'tail'}
                  			         				>{rowData.value}</Text>
                  		         				</View>
                  	         			</TouchableOpacity>
                  	         		)
                             }
      					/>
                {
                  this.state.state === 'select' ?
                    (
                      <View pointerEvents="box-none" style={styles.overlay}>
                        <CircleButton
                          onPress={this._exportSelectItem.bind(this)}
                          size={60}
                          style={styles.buttonText}
                          text={'导出'}
                          backgroundColor={'#69F0AE'}
                          position={{x:30,y:15}}
                        />
                        <CircleButton
                          onPress={this._delectSelectItem.bind(this)}
                          size={60}
                          style={styles.buttonText}
                          text={'删除'}
                          backgroundColor={'#FF5252'}
                          position={{x:30,y:15}}
                        />
                        <CircleButton
                          onPress={this._quitSelect.bind(this,null)}
                          size={60}
                          style={styles.buttonText}
                          text={'返回'}
                          backgroundColor={'#FFAB40'}
                          position={{x:30,y:30}}
                        />
            					</View>
                    ) : null
                }
      				</View>
		        </View>
		    </DrawerLayoutAndroid>
	    );
	}

	_handlePress(rowData){

		this.props.navigator.push(
			{
				name: "practiceScene",
				db: rowData.value
			}
		)
	}

  _enterSearchCoverImageScene(rowData){
      this.props.navigator.push(
        {
          name: "searchCoverImageScene",
          itemName : rowData.value
        }
      )
  }

	_enterSelect(){//rowID之后可能会有用

		let data = this.state.data.map((currentValue)=>{
			return {
				value: currentValue.value,
				mark: false
			};
		});

		this.setState({
			state: 'select',
			data: data,
			dataSource: this.state.dataSource.cloneWithRows(data)
		});
	}

	_handleSelect(rowData,rowID){
		//判断点击条目应该取消还是选中
		let index;
		//deep copy
		let data = JSON.parse(JSON.stringify(this.state.data));

		if((index = this.selectItems.indexOf(rowData.value)) == -1){
			this.selectItems.push(rowData.value);
			data[rowID].mark = true;
			//ToastAndroid.show(JSON.stringify(this.data[rowID]),ToastAndroid.SHORT);
		}else{
			this.selectItems.splice(index,1);
			data[rowID].mark = false;
			//ToastAndroid.show(JSON.stringify(this.data[rowID]),ToastAndroid.SHORT);
		}

		this.setState(
			{
				data: data,
				dataSource: this.state.dataSource.cloneWithRows(data)
			}
		);
	}

	_quitSelect(passData){
    //把quitSelect放到CircleButton会让passData有数据，如何解决
		let data = passData || this.state.data.map((currentValue)=>{
			return {
				value: currentValue.value,
				mark: null
			};
		})

		this.selectItems=[];
		this.setState({
			state:'home',
			data: data,
			dataSource : this.state.dataSource.cloneWithRows(data)
		})
	}

	_exportSelectItem(){
		if(this.selectItems.length === 0){
			ToastAndroid.show('没有选中任何词集',ToastAndroid.SHORT);
		}else{

	  		var path = RNFS.ExternalStorageDirectoryPath+'/透析记词';

  			AsyncStorage.multiGet(this.selectItems).then((items)=>{

  				//ToastAndroid.show(JSON.stringify(items),ToastAndroid.SHORT);
  				return RNFS.mkdir(path).then(()=>{
  					return items.map((value,index)=>{
  						return RNFS.writeFile(path+'/'+value[0]+'.json',value[1],'utf8');
  					});

  				}).then((results)=>{
  					ToastAndroid.show('导出到：'+path,ToastAndroid.SHORT);

	  				this._quitSelect();
  				});
  			}).catch((e)=>{
	  			ToastAndroid.show('export error:'+e,ToastAndroid.SHORT);
	  		});
	  	}
	}

	_delectSelectItem(){
		if(this.selectItems.length === 0){
			ToastAndroid.show('没有选中任何词集',ToastAndroid.SHORT);
		}else{
			Alert.alert(
				'',
				'删除选中词集?',
				[
					{text:'确认', onPress:()=>{

						rvDB.delectDataCollection(this.selectItems).then(()=>{
							//找出this.state.data中没有在selectItems中的数据
							let data = this.state.data.filter((currentValue)=>{
								return this.selectItems.indexOf(currentValue.value) === -1;
							}).map((currentValue)=>{
								return {
									value: currentValue.value,
									mark: null
								};
							})

							//ToastAndroid.show(JSON.stringify(this.state.data),ToastAndroid.SHORT);
							this._quitSelect(data);

						}).catch((e)=>{
							ToastAndroid.show("error: "+e,ToastAndroid.SHORT);
						})

					}},
					{text:"取消", onPress:()=>{}}
				]
			)
		}
	}

	_selectAllItems(){
		let data = this.state.data.map((currentValue)=>{
			return {
				value: currentValue.value,
				mark: true
			};
		});

		data.forEach((currentValue)=>{
			if(this.selectItems.indexOf(currentValue.value) === -1){
				this.selectItems.push(currentValue.value)
			}
		},this);

		this.setState({
			modalVisible: false,
			data: data,
			dataSource: this.state.dataSource.cloneWithRows(data)
		});

	}

	_clearAllSelectItems(){
		let data = this.state.data.map((currentValue)=>{
			return {
				value: currentValue.value,
				mark: false
			};
		});

		this.selectItems = [];

		this.setState({
			modalVisible: false,
			data: data,
			dataSource: this.state.dataSource.cloneWithRows(data)
		})
	}

	//返回建设置
	_homeSceneBackPressHandler(){

		var currentRoutes = this.props.navigator.getCurrentRoutes().pop();

		if(currentRoutes.name === 'homeScene'){

			if(this.drawerStateOpen){
				//drawer is in open state
				this.drawer.closeDrawer();
			}else if(this.state.state === 'select' && !this.state.modalVisible){
				this._quitSelect();
		  //}else if(this.state.modalVisible){
		  		//can't catch back press when Modal show
			}else{
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
			}
			return true;
		}else{
			return true;
		}
	}

}

const styles = StyleSheet.create({
  mainContainer: {
  	flex:1,
  	backgroundColor:"#F5F5F5"
  },
  itemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 3,
    backgroundColor:"#FFFFFF",
    flex:0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderBottomWidth:1,
    borderColor:"#90CAF9"
  },
  itemContainerInSelect: {
  	paddingHorizontal: 16,
    paddingVertical: 3,
    backgroundColor:"#FFFFFF",
    flex:0,
    flexDirection: 'row',
    justifyContent:'flex-start',
    borderBottomWidth:1,
    borderColor:"#90CAF9",
    backgroundColor: '#E0E0E0'
  },
  itemText:{
    flex: 1,
    paddingLeft: 16,
    fontSize:21,
  	textAlignVertical:'center'
  },
  toolBar: {
  	height:56,
  	backgroundColor: "#2196F3"
  },
  selectOption: {
  	fontSize:22,
  	paddingVertical:14,
  	color:'white',
  	paddingLeft: 22,
  	backgroundColor: '#757575'
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems:'flex-end',
  },
  buttonText:{
  	textAlign: 'center',
  	color:'white',
  	fontSize:18
  },
  bookCover:{
    width: 67,
    height: 97
  }
});
