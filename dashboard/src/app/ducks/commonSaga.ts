import { all, takeLatest, put, select } from 'redux-saga/effects'
import * as actions from './actions'


// Test query setup
import { RootState } from '../rootReducer'

const getFilterSelections = (state: RootState) => {
  const queryParams: any = {
    // @ts-ignore
    years: state.filters.selectedYears.map((item: any) => item.year),
    // @ts-ignore
    states: state.filters.selectedStates.map((item: any) => item.abv),
    // @ts-ignore
    hrsa_designations: state.filters.selectedHrsaDes.map((item: any) => item.abv),
    entity_keywords: state.search.entityKeyword,
    findings_keywords: state.search.findingsKeyword,
  }

  let queryString = '/api/records/?'

  for (let key in queryParams) {
    if (queryParams[key].length) {
      queryString += `${key}=${queryParams[key]}&`
    }
  }

  return queryString
}


// Workers

function* fetchData() {
  try {
    const apiQuery = yield select(getFilterSelections)
    const data = yield fetch(apiQuery)
      .then((res) => res.json())
    yield put(actions.fetchAuditDataSuccess(data))
  } catch (error) {
    console.log(error)
  }
}

function* init() {
  yield put(actions.fetchAuditData())
}


// Watchers

function* fetchDataWatcher() {
  yield takeLatest(
    [
      'FETCH_AUDIT_DATA',
      'ADD_FILTER_ITEM',
      'REMOVE_FILTER_ITEM',
      'SET_FINDINGS_KEYWORDS',
      'SET_ENTITY_KEYWORDS'
    ], fetchData
  )
}


// Saga

function* commonSaga() {
  yield all([
    fetchDataWatcher(),
    init(),
  ])
}

export default commonSaga
