// @flow
import * as React from 'react'
import { remoteData, type RemoteData } from '@sbizeul/fp-flow'


type Props<E, A> = $ReadOnly<{|
  data: RemoteData<E, A>,
  children: A => React.Node,
  failure: E => React.Node,
  loading: void => React.Node,
  notAsked?: void => React.Node,
  didMount?: RemoteData<E, A> => mixed,
  delay?: number
|}>

type State = {|
  canRenderLoading: boolean,
  isSuccess: boolean,
  isFailure: boolean,
  isLoading: boolean,
  isNotAsked: boolean
|}


export default class ReactRemote extends React.Component<Props<*, *>, State> {

  static defaultProps = {
    delay: 0
  }

  state = {
    canRenderLoading: false,
    isSuccess: false,
    isFailure: false,
    isLoading: false,
    isNotAsked: false
  }

  timeoutId: TimeoutID

  static getDerivedStateFromProps(props: Props<*, *>) {
    return {
      isSuccess: remoteData.isSuccess(props.data),
      isFailure: remoteData.isFailure(props.data),
      isLoading: remoteData.isLoading(props.data),
      isNotAsked: remoteData.isNotAsked(props.data),
    }
  }

  componentDidMount() {
    if (this.props.didMount != null) {
      this.props.didMount(this.props.data)
    }
    if (typeof this.props.delay === 'number' && this.props.delay === 0) {
      this.setState({ canRenderLoading: true })
    }
  }

  componentDidUpdate() {
    if (this.state.canRenderLoading && this.timeoutId != null) {
      clearTimeout(this.timeoutId)
    }
  }

  renderSuccess(data: *) {
    if (this.state.canRenderLoading && this.timeoutId != null) {
      clearTimeout(this.timeoutId)
    }
    return this.props.children(data)
  }

  renderFailure(error: *) {
    if (this.state.canRenderLoading && this.timeoutId != null) {
      clearTimeout(this.timeoutId)
    }
    return this.props.failure(error)
  }

  delayLoading(delay: number) {
    this.timeoutId = setTimeout(
      () => this.setState({ canRenderLoading: true }),
      delay
    )
  }

  renderLoading() {
    const { delay } = this.props
    if (this.state.isLoading && typeof delay === 'number' && delay > 0) {
      this.delayLoading(delay)
    }
    return this.state.canRenderLoading ? this.props.loading() : null
  }

  renderNotAsked() {
    return this.props.notAsked ? this.props.notAsked() : null
  }

  render() {
    return remoteData.fold({
      Success: this.renderSuccess,
      Failure: this.renderFailure,
      Loading: this.renderLoading,
      NotAsked: this.renderNotAsked
    }, this.props.data)
  }

}
