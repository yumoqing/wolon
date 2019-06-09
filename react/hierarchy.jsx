/*
props={
	cls: class for the hierarchy
	element: root component 
	dataurl: get remote children
	children: children
}
*/
const rootcls={
}
const element={
}

class placeholder {
	width:"16px";
	height:"16px";
}
const nodeExpandedCls={
}
const nodeColapsedCls={
}
	

class Placeholder extends React.Component {
	render(){
		return <img className={placeholder} src="/imgs/empty.png" />
	}
}

class BinStateImage extends React.Component {
	constructor(props){
		super(props);
		this.state = { status:0};
	}
	onChange = () => {
		this.setState({
			status : this.state.status ? 0 : 1
		});
		if (this.props.onChange){
			this.props.onChange(this.state.status);
		}
	}
	render(){
		if (this.state.status){
			return <img src={this.props.img1} 
				onClick={this.onChange}
				></img>
		}
		return <img src={this.props.img0} onClick={this.onChange}></img>
	}
}

/*
class HierarchyNode extends React.Component {
	constructor(props){
		super(props);
		this.state = { cls:nodeColapsedCls}
	}
	toggleSubnode(status){
		this.setState({status:status});
	}
	render(){
		return (
			<div className={rootcls}>
				<div className={elementCls} >
				{ this.props.children.length>0 ?
					<BinStateImage img0="/img1/arrowright.png"
						img1="/imgs/arrowdown.png"
						onChange={this.toggleSubNodes} />
				: <PlaceHolder /> }
				<this.props.element /> 
				{ this.props.children.length > 0 &&
					this.props.children.map((C) =>
						<div className={nodeCls}>
							<PlaceHolder />
							<C></C>
						</div>
				}
				</div>
			</div>
		);
	}
}

root=<span>I'm Root</span>;
children = [
	<HierarchyNode element='node1' children={[]} >,
	<HierarchyNode element='node2' children={[]} >,
	<HierarchyNode element='node3' children={[]} >,
	<HierarchyNode element='node4' children={[]} >,
	<HierarchyNode element='node5' children={[]} >,
];
ReactDOM.render(
	<HierarchyNode element={root} children={chldren} >
	</Hierarchy>,
	document.getElementById('app')
);
*/
const afunc = () => {
	console.log('clicked');
}

ReactDOM.render(
	<BinStateImage img0="/imgs/arrow_right.png"
					img1="/imgs/arrow_left.png"
					/>,
	document.getElementById('app')
);
