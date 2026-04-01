// 데이터 수집용 Node.js 스크립트
const fs = require('fs');
const path = require('path');

async function fetchData() {
  console.log('데이터 수집 중...');
  // 여기에 데이터 수집 로직 구현
  const dummyData = [{ id: 1, name: 'Sample Store', location: { lat: 0, lng: 0 } }];
  const dataPath = path.join(__dirname, '../src/data/stores.json');
  
  fs.writeFileSync(dataPath, JSON.stringify(dummyData, null, 2));
  console.log('데이터 수집 완료: src/data/stores.json');
}

fetchData().catch(console.error);
