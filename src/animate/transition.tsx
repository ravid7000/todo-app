import React from 'react';
import createSCC from 'react-scc'

enum ANIMATE_POS {
  UNMOUNTED = 'unmounted',
  ENTERING = 'entering',
  ENTERED = 'entered',
  EXITING = 'exiting'
}

export interface TransitionProps {
  /**
   * control visibility of component
   */
  in: boolean;
  /**
   * set animation duration (in milliseconds)
   */
  duration?: number;
  /**
   * enter transition
   */
  enterTransition?: string;
  /**
   * enter transition
   */
  exitTransition?: string;
  /**
   * className
   */
  className?: string;
  /**
   * Callback after component is exited
   */
  onExit?: () => void;
  /**
   * Callback on mounted component
   */
  onEnter?: () => void;
}

interface State {
  duration: number;
  pos: ANIMATE_POS;
}

const Transition = createSCC<TransitionProps, State>({
  state: {
    duration: 300,
    pos: ANIMATE_POS.UNMOUNTED
  },
  displayName: 'Transition',
  defaultProps: {
    enterTransition: 'fadeIn',
    exitTransition: 'fadeOut',
  },
  controller: ({ props, state, onMount, beforeUpdate, onDestroy }) => {
    let timer: any;

    let once = false

    state.set({
      duration: props.duration || 300,
      pos: ANIMATE_POS.UNMOUNTED,
    })

    onMount(() => {
      if (props.in) {
        state.update(curr => ({ ...curr, pos: ANIMATE_POS.ENTERING }))
        timer = setTimeout(() => {
          state.update(curr => ({ ...curr, pos: ANIMATE_POS.ENTERED }))
          if (typeof props.onEnter === 'function') {
            props.onEnter()
          }
        }, state.currentValue.duration)
      }
    })

    beforeUpdate((nextProps) => {
      if (!nextProps.in && !once) {
        state.update(curr => ({ ...curr, pos: ANIMATE_POS.EXITING }))
        timer = setTimeout(() => {
          state.update(curr => ({ ...curr, pos: ANIMATE_POS.UNMOUNTED }))
          if (typeof props.onExit === 'function') {
            props.onExit()
          }
        }, state.currentValue.duration)

        once = true
      }
    })

    onDestroy(() => {
      clearTimeout(timer)
      if (typeof props.onExit === 'function') {
        props.onExit()
      }
    })
  },
  component: ({ children, enterTransition, exitTransition, state, className }) => {
    if (state.pos === ANIMATE_POS.UNMOUNTED || !children) {
      return null
    }

    let transitionClass = state.pos === ANIMATE_POS.ENTERING ?
      enterTransition : state.pos === ANIMATE_POS.EXITING ?
      exitTransition : ''

    const combineClassNames = `${className || ''} ${transitionClass || ''}`.trim()

    return <div className={combineClassNames === '' ? undefined : combineClassNames}>{React.cloneElement(children as any, { transitionState: state.pos })}</div>
  }
})

export default Transition