class ReactiveEffect {
  private _fn
  public scheduler
  deps: any[] = []
  constructor(fn: () => any, scheduler?: () => any) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run() {
    activeEffect = this
    return this._fn()
  }

  stop() {
    cleanupEffect(this)
  }
}

function cleanupEffect(effect: ReactiveEffect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
}

const targetMap = new Map()
export function track(target: any, key: string | symbol) {
  console.log('开始执行 track. target => ', target, ' key =>', key)
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  if (!activeEffect) return

  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export function trigger(target: any, key: string | symbol) {
  const depsMap = targetMap.get(target)

  for (let effect of depsMap.get(key)) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

let activeEffect: ReactiveEffect
export function effect(fn: () => any, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function stop(runner: any) {
  runner.effect.stop()
}
