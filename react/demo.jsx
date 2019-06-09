//定义日期组件，组件名不能为js关键字Date
class GCDate extends React.Component {
    constructor(props) {
        super(props);
    }

    //日期内容为组件属性值，属性值为父日历组件的state值
    render() {
        return (
            //引入样式1：行内样式，标准css样式（驼峰）都可以用，还可以用js
            <span style={{ fontSize: '30px', }} onDoubleClick={this.props.showBeiJingHandler}>
                {this.props.date}
                <span style={{ display: 'inline', visibility: this.props.show ? 'visible' : 'hidden', }}>
                    (北京时间)
                </span>
            </span>
        )
    }

}

//时间组件
class GCTime extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {

        const timeStyle = {
            color: 'red',
        };
        return (
            //引入样式2：react式行内样式
            <span style={timeStyle}>{this.props.time}</span>
        )
    }
}


//日历组件
class Calendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timeAndDate: new Date(),
            showDate: true,
            startOrStop: 'Stop',
        }
        //方法中如果使用this关键字，必须在此指定
        this.countToggle = this.countToggle.bind(this);

    }

    //计数开关
    countToggle(flag, e) {

        //e为事件响应函数的默认参数，类似dom的原生事件对象
        //当有多个参数时，e永远为最后一个参数，类似dom的原生事件对象

        if (flag == undefined || 'Start' == flag) {

            //设置state有2中方式，入参为函数/入参为对象
            //方式1：入参对象
            this.setState({ startOrStop: 'Stop' });
            this.timeId = setInterval(() => {
                //方式2：入参函数
                this.setState((oldState, props) => {
                    return {
                        timeAndDate: new Date(),
                    }
                });
            });
        } else if ('Stop' == flag) {
            this.setState({ startOrStop: 'Start' });
            clearInterval(this.timeId);
        } else {
            alert("error.....");
        }
    }

    //组件声明周期函数，此函数在组件渲染完后执行
    componentDidMount() {
        this.countToggle();
    }

    render() {
        return (
            //引入样式3：引入外部样式
            <antd.Card bordered={false} title="日历">
                Date:(双击日期)
                {/*
                    1. state值以子组件属性的方式传递给子组件；
                    2. 父组件函数以子组件属性的方式传递给子组件*/}
                <GCDate 
                    show={this.state.showDate} 
                    date={this.state.timeAndDate.toLocaleDateString()} 
                    showBeiJingHandler={e => { this.setState((preState, props) => { return { showDate: !preState.showDate } }) }} 
                />

                <br />

                {/*
                    1.不能通过onClick={this.countToggle(参数)}绑定事件，这是函数调用而不是绑定；
                    2.事件响应函数传递参数方式1（推荐）：箭头函数：e需要显示传入，一般放在最后
                        onClick={(e) => { this.countToggle(参数, e) }}
                    3.事件响应函数传递参数方式2：bind，this不算参数但必须指定，e作为最后一个参数默认传递
                        onClick={this.countToggle.bind(this, 参数)}
                
                */}
                Time:<button onClick={(e) => { this.countToggle(this.state.startOrStop, e) }}>{this.state.startOrStop}</button>
                <GCTime time={this.state.timeAndDate.toLocaleTimeString()} />
            </antd.Card>
        )
    }

}

ReactDOM.render(<Calendar />, document.getElementById('app'));
