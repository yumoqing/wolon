/*
props={
	cls: class for the hierarchy
	element: root component 
	dataurl: get remote children
}
*/
const rootcls={
}
const hierarchynode={
}

const placeholder = {
	position:"relative",
	float:"left",
	display:"block",
	width:"16px",
	height:"16px"
}

const childrenOpen={
	display:"block"
}
const childrenClose={
	display:"none"
}
	

class Placeholder extends React.Component {
	render(){
		return <img src="/imgs/empty.png" width="16px" height="16px"/>
	}
}

class BinStateImage extends React.Component {
	constructor(props){
		super(props);
		console.log('data=',props.data);
		this.state = { status:props.state?props.state:0};
		console.log('binstateimage=',this.state.status);
	}
	onChange = () => {
		const v = this.state.status==1 ? 0 : 1;
		this.setState({
			status : v
		});
		console.log('binstateimage=',v);
		if (this.props.onChange){
			this.props.onChange(v);
		}
	}
	render(){
		const img = this.state.status? this.props.img1 : this.props.img0;
		return <img src={img} onClick={this.onChange} ></img>
	}
}

class Hierarchy extends React.Component {
	constructor(props){
		super(props);
		this.state = { open:0}
	}
	toggleSubnode(status){
		console.log('status=',status)
		this.setState({open:status});
	}
	render(){
		const openStatus = this.state.open;
		console.log('openStatus=',openStatus);
		return (
			<div className='hierarchy'>
				<div className="hierarchy_line clearfix" >
					<div class="box">
					{ this.props.children ?
					<BinStateImage img0="/imgs/arrow_right.png"
						img1="/imgs/arrow_left.png" 
						state={openStatus}
						onChange={this.toggleSubnode.bind(this)} />
					: <Placeholder /> 
					}
					</div>
					<div class="box">
						{this.props.element}
					</div>
				</div>
				{ this.props.children &&
					<div className={openStatus?'hierarchy hierarchy_children_open clearfix'
							:'hierarchy hierarchy_children_close clearfix' } >
						<div className="box">
						<Placeholder />
						</div>
						<div className="box">
							{this.props.children}
						</div>
					</div>
				}
			</div>
		);
	}
}

const data={
	a:100,
	b:90,
	c:'322222'
};

const root=<span>I am Root</span>;
ReactDOM.render(
	<Hierarchy element={root} data={data} >
		<h1>This is a test</h1>
		<p>test a colapsable div</p>
		<Hierarchy element="Node1">
			<Hierarchy element="Node1.1">
				<Hierarchy element="Node1.1.1">
				</Hierarchy>
				<Hierarchy element="Node1.1.2">
				</Hierarchy>
				<Hierarchy element="Node1.1.3">
				</Hierarchy>
				<Hierarchy element="Node1.1.4">
				</Hierarchy>
			</Hierarchy>
		</Hierarchy>
		<Hierarchy element="Node2" />
	</Hierarchy>
	,
	document.getElementById('app')
);
