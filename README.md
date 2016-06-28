# 搭建一个简单的React单元测试环境

## React 使前端单元测试更容易实现
关于单元测试的意义，以及TDD，BDD这些暂不讨论，只谈谈前端基于 React 框架开发的项目，如何进行单元测试。

前端的测试本不应该只有单元测试，因为除了保证业务逻辑的正确，前端更多的是关于渲染和用户交互，前端最终面向的是用户。

要完成上述测试我们需要具有满足以下条件的一个工具：
- 能够测试用户交互事件
- 能够测试交互事件的响应
- 能够确保正确的渲染
- 在多浏览器环境下运行我们的测试（兼容性测试）
- 当代码文件发生变化后自动运行
- 很好的持续集成服务（比如 Travis ）一起运行

在使用 React 之前，没有很好的方案来完成用户交互的测试和页面渲染的测试。

之所以说有了 React 后这两点能比较好的解决主要是由于：对于一个 React 实例，如果传入的参数是相同的，那么这个实例都会渲染出一样的输出。不管是第几次渲染，或是谁渲染的它，也不管我们在页面的什么地方渲染它，都会得到一样的输出。

**Always the same.** 基于这一点，当我们测试 React 组件的时候不需要很复杂的工具来完成，**测试 React 组件只关心传入其中的参数**，而不太需要关心全局变量和配置对象。

我们通过尽量避免使用 state 来完成上面的工作。这在 函数式编程中被称作 [referrential transparency](https://en.wikipedia.org/wiki/Referential_transparency)，这不是 React 的一个专有名词。官方文档中也推荐尽量的避免 state 的使用。(office docs recommend avoiding the use of state as much as possible)。

当我们需要测试用户交互的时候。React 通过回调绑定对应事件的处理方法，这使得我们很容易的编写测试用例并保证对应的事件触发正确的回调函数。由于 React 组件会自己完成自己的渲染工作，我们触发事件过后可以通过检查它渲染的 HTML 解构来确定事件是否正确。这些得以实现主要由于 React 组件只关心自己的状态变化，在这个组件上触发的事件不会到另一个组件上去执行（A click here doesn't change thing there）。使用 React 我们不需要处理事件嵌套的问题。只是一些定义好的函数的调用。

React 使用 virtual DOM 技术将一个组件的 render 到一个 Javascript 变量上。我们在做测试的时候只需要测试这个virtual DOM Javascript 变量的引用即可。

## 搭建测试环境
使用到的工具: 
- karma 作为 test-runner
- jasmine 作为 测试框架(可选也可以使用 mocha 等其他任意你喜欢的测试框架)
[Jasmine 和 Mocha 的简单对比](http://imweb.io/topic/56895ae54c44bcc56092e40a)

### Step 1 安装必要工具

    // 你可能需要先执行 npm init -y
    // 全局安装 karma 获取可执行命令 karma
    npm install karma -g
    // 本地添加 karma
    npm install karma -D
    // 添加 karma-jasmine 依赖，也可以添加其他任意测试框架
    npm install karma-jasmine jasmine-core -D
    // 添加 karma 自动打开浏览器设置
    npm install karma-chrome-launcher -D

### Step 2 生成 karma 配置文件
karma 为我们提供了一个简单的问答式配置文件生成工具，只需要在 `package.json` 同级目录下执行 `karma init` 就可以根据简单的问答生成一个 `karma.conf.js` 配置文件。

> windows 平台下 `karma init` 在 cygwin 环境下可能不能正确的执行。如果不能正确执行，请使用 `cmd` 来执行该命令。完成初始配置文件的生成。

生成配置文件后，我们需要组织我们的文件结构。

<rootDir>下生成新建 src 目录用来存放源代码，src目录下新建 \_\_tests\_\_ 目录用来存放测试代码。

![目录结构](http://upload-images.jianshu.io/upload_images/1388391-4dbf6580d8246cc9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

生成默认配置文件后，你可以手动的修改配置文件，其中我们需要修改 files 属性，用来指定我们需要被测试的文件。

按照约定和便于维护我们的测试文件统一以 `-test.js` 结尾修改后的files 属性内容如下:
    
    // 与 gulp 的 src 方法参数一样
    files: [ 'src/**/*-test.js' ]

__另外一种配置files方法：__ 
在 <rootDir> 下新建 `tests.webpack.js`
tests.webpack.js 文件内容如下：

    var testContext = require.context('src', true, /-test\.js$/);
    textContext.keys().forEach(testContext)

[require.context](https://webpack.github.io/docs/context.html#require-context)

如果使用 `tests.webpack.js` 作为配置项，files 修改为:

    files: [ 'tests.webpack.js' ]

### Step 3 环境测试
在 src/\_\_tests\_\_ 目录下新建 文件 `env-test.js`

`evn-test.js` 文件内容如下：

    describe('Env test', function(){
      it('true to be true', function(){
        expect(true).toBe(true);
      })
    })

第一个测试描述就完成了，`describe`，`it`，`expect` 等都是 [Jasmine](http://jasmine.github.io/) 的关键字。如果你使用的是 `mocha` 可能还需要自己导入 `expect` 等其他依赖。

> 如果你使用了es 6 或 commonJS 的模块加载方法你需要对配置文件在执行的时候执行编译工作生成浏览器能执行的 es 5代码，马上将进行这方面知识的补充。

在 <rootDir> 下 执行 `karma start` 开启测试。

该命令会基于 `karma.conf.js` 配置文件中的 browsers 配置自动打开相应浏览器进行测试([浏览器配置和依赖](https://karma-runner.github.io/1.0/config/browsers.html))。并在 Terminal 终端下显示测试结果。

![测试运行结果](http://upload-images.jianshu.io/upload_images/1388391-548cc2edd95ea5f9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> 如果 karma start 不能正常的运行，可以尝试修改 package.json 中的 test 为 `karma start --config karma.conf.js` 。然后运行 `npm test`

### Step 4 入口文件预处理 - webpack 
前面提到了如果使用了 es 6 或其他一些浏览器不能识别的代码特性我们就需要预处理我们的代码。由于 `webpack` 基本是 `React` 开发的标配，所以也使用 `webpack` 做我们测试文件中的预处理工具。
  
    // 安装 webpack 和 karma-webpack 依赖
    npm install webpack karma-webpack -D
    // 使用 babel 预处理代码
    npm install babel-loader babel-preset-es2015 babel-preset-react -D

配置 karma.conf.js :
在 `config.set({ })` 中添加 webpack 配置，并为入口文件添加 preprocessors:

    config.set({
      preprocessors: {
        'src/**/*-test.js': ['webpack']
        // 如果使用 tests.webpack.js 如下配置
        // 'tests.webpack.js': ['webpack']
      }
      webpack: {
        module: {
          loaders: [
            { 
              test: /\.jsx?$/, 
              exclude: /node_modules/,
              loader: 'babel',
              query: {
                presets: ['es2015', 'react']
              }
            }
          ]
        }
      }
    })
> 由于我们使用 webpack 进行es代码编译，webpack 会自动的处理我们的依赖和导入等，所以入口文件只需要 test 文件即可。

由于添加了 es6 和 react 的支持，我们的测试代码也可是使用 es6 的写法，让我们用es 6的写法来修改我们之前的 `env-test.js`文件：
    
    // function 改为 =>
    describe('Env test', ()=> {
      it('true to be true', ()=> {
        expect(true).toBe(true)
      })
    })

查看 Terminal 终端发现结果依然正确。（有时可能你需要重启`karma start` 看看）。

### Step 5 添加一个简单的组件
大多数我们的 React 组件遵循下面 3 个步骤:
1. Render（渲染）
2. Find specific node（找到对应节点）
3. Check contents（验证是否正确）

为了完成这些我们需要使用 React 官方提供的 `TestUtils` 或者 airbnb 提供的 `enzyme`。
[TestUtils文档](https://facebook.github.io/react/docs/test-utils.html)，[enzyme文档](http://airbnb.io/enzyme/)

我们的例子以一个简单的 title 控件作为展示，该控件接受一个 icon 属性用来展示其图标，一个 text 属性用来展示其具体的文本内容。我们先为这个组件添加测试用例。
在 `src/__tests__` 目录下添加 `Title-test.js` 文件。内容如下：

    // 记得先安装 react 和 react-addons-test-utils 依赖
    import React from 'react'  
    // 低版本react 
    // import React from 'react/addons'
    import TestUtils from 'react-addons-test-utils'
    // 低版本react
    // const TestUtils = React.addons.TestUtils;

    import Title from '../Title'

    ['edit', 'finish'].map((icon)=>{
      ['Edit text', 'Finish text'].map((text)=>{
        describe(`<Title icon=${icon} text=${text} />`, ()=>{
          let title = TestUtils.renderIntoDocument(<Title icon={icon} text={text} />);

          it(`there sholud has the icon has class icon-${icon}`, ()=>{
            let iconDom = TestUtils.findRenderedDOMComponentWithClass(title, `icon-${icon}`);
            expect(iconDom).toBeDefined();
          })
          it(`text should to be ${text}`, ()=>{
            let textDom = TestUtils.findRenderedDOMComponentWithTag(title, 'span');
            expect(textDom.textContent).toEqual(`${text}`)
          })
        })
      })
    })

添加完成后由于我们没有 `../Title.js` 文件，测试肯定会报错的，如果karma 服务退出请重新启动。

接下来我们就需要编写实例让我们的测试通过，在 `src` 目录下添加 `Title.js` 文件，内容如下：

    import React from 'react'
    export default class Title extends React.Component {
      constructor(props){
        super(props);
      }
      render(){
        let { text = '', icon = 'edit' } = this.props;
        return (<h2>
          <i className={ 'icon ' + (icon ? ('icon-' + icon) : '')  }></i>
            <span>{text}</span>
        </h2>)
      }
    }

查看Terminal终端，

![测试结果](http://upload-images.jianshu.io/upload_images/1388391-99cbf7ee3b07c37b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### Step 7 查看测试代码覆盖率
karma 为我们提供了一个代码覆盖率的工具，`karma-coverage` 使用前先通过 npm 进行安装。
要生成 coverage 我们需要对 测试测试文件预处理时添加 `coverage` 步骤，大概意思是指:
  
    // karma.conf.js
    preprocessors: {
      '要生成coverage报告的源文件的匹配规则': [...,  'coverage']
    }

由于我们的代码使用 webpack 做预处理，而测试文件中又依赖源文件，而使用 webpack 是不能在依赖 entry 中的文件的，为了解决这个问题，我们还是让webpack自动给我们解决项目依赖，但是需要使用 `isparta-loader` [github地址](https://github.com/deepsweet/isparta-loader) 插件(npm 安装)，使用这个插件在 webpack 的 loader 中进行添加 coverage 的操作。将目标文件通过 isparta-loader 在 webpack 中加载。修改后 webpack 文件如下:
     
    webpack: {
        isparta: {
            // 前两个值是默认参数
            embedSrouce: true,
            noAutoWrap: true,
            // these babel options will be passed only to isparta and not to babel-loader
            babel: {
                presets: ['es2015', 'react']
            }
        },
        module: {
            loaders: [
                { 
                    test: /\.jsx?$/, 
                    exclude: /node_modules/,
                    loader: 'babel',
                    query: {
                        presets: ['es2015', 'react']
                    }
                }
            ],
            preLoaders: [
                {
                    test: /\.jsx?$/,
                    // 只处理关系的源代码，避免处理 node_modules 等内容
                    exclude: /node_modules|__tests__/,
                    loader: 'isparta'
                }
            ]
        }
    }

除此之外还需要在 reporters 中添加 covearge, 并添加 coverageReporter 如下:

    reporters: ['progress', 'coverage'],

    coverageReporter: {
        type: 'html', // default html
        dir: 'coverage'
    }

修改完 `karma.conf.js` 配置文件后应该重启 karma 服务。
在次运行 `karma start `或 `npm test` 除了会正常的运行我们的测试用例，还会依据我们的 `coverageReporter` 配置在对应目录下生成 coverage 结果文件。我们是以 html 格式生成的文件，可以直接在浏览器中查看。

![覆盖率测试结果](http://upload-images.jianshu.io/upload_images/1388391-04977640c095526a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> 关于 karma-coverage 配合 webpack 生成源代码的覆盖率报告可以查看 [karma-webpack issues 21](https://github.com/webpack/karma-webpack/issues/21) 获取更多信息

至此一个基本的 Karma + Jasmine + Webpack 的前端测试平台搭建完成。教程中还有很多未涉及到的内容请自己结合自己项目参考相关文档完成。教程中难免出现错误，如果您发现什么错误，请联系我进行相关修改。
