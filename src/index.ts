import { pick, debounce, isObject, queryToState, stateToQuery, IQueryParser, IQueryStringify, filterQuery } from "./utils/util";
import { deepEqual } from "./utils/deepEqual";

type SyncQueryConfig = {
    wait?: number,                          // 函数防抖的等待时间， 单位 ms
    parser?: IQueryParser,                  // 解析器：用于将路由参数 query 解析到 state，默认是 JSON.parse
    stringify?: IQueryStringify,            // 生成器：用于生成 state 对应的 query 字符串，默认是 JSON.stringify
    disableAutoSync?: boolean,              // 是否关闭自动同步
}

export function SyncQueryFactory(stateList: string[], config?: SyncQueryConfig) {
    return function (WrappedComponent) {
        return syncQueryHOC(WrappedComponent, stateList, config);
    }
}

export function syncQueryHOC(WrappedComponent, stateList: string[], config?: SyncQueryConfig): any {
    if (!isObject(config)) {
        config = {
            wait: 300,
        }
    } else {
        config = {
            wait: 300,
            ...config,
        }
    }
    return class Enhancer extends WrappedComponent {
        private prevStateCache = {};
        constructor(props) {
            super(props);
            this.state = {
                ...this.state,
                ...this.getStateFromURL(stateList),
            }
            this.prevStateCache = this.state;
            if (config.disableAutoSync === true) {
                this.triggerSync = () => {
                    this.stateDiffEffect(this.state);
                }
            }
            this.stateDiffEffect = debounce(this.stateDiffEffect, config.wait).bind(this);
        }
        private getStateFromURL(stateList: string[]) {
            const query = location.href.split('?')[1];
            if (query == null) {
                return;
            }
            return queryToState(query, stateList, config.parser);
        }
        private syncStateToURL(state: Object) {
            const [locationAddress, oldQuery] = location.href.split('?');
            const restQuery = filterQuery(oldQuery, (key, value) => (stateList.indexOf(key) === -1))
            const query = stateToQuery(state, config.stringify);
            const href = `${locationAddress}?${query}&${restQuery}`;
            location.href = href;
        }
        componentDidUpdate(prevProps, prevState) {
            if (config.disableAutoSync !== true) {
                this.stateDiffEffect(this.state);
            }
            return (
                super.componentDidUpdate &&
                super.componentDidUpdate(prevProps, prevState)
            );
        }
        private stateDiffEffect(state) {
            const prevState = this.prevStateCache;
            const pickedPrevState = pick(prevState, stateList);
            const pickedState = pick(state, stateList);

            const isDiff = !deepEqual(pickedPrevState, pickedState);
            if (isDiff) {
                this.syncStateToURL(pickedState);
            }
            this.prevStateCache = state;
        }
    }
}
