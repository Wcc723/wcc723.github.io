import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatDate, dateFromPath, readingText } from './format.mjs'

test('formatDate：字串只取開頭的年月日，不做時區轉換', () => {
  assert.deepEqual(formatDate('2022-01-10'), { iso: '2022-01-10', text: '2022.01.10' })
  assert.deepEqual(formatDate('2022-6-12 15:28:32'), { iso: '2022-06-12', text: '2022.06.12' })
  // UTC 的 16:00 在台北已經是隔天，但字串開頭就是檔名日期時照字串
  assert.deepEqual(formatDate('2026-10-05T16:00:00.000Z'), { iso: '2026-10-05', text: '2026.10.05' })
})

test('formatDate：Date 物件用 Asia/Taipei 換算', () => {
  assert.equal(formatDate(new Date('2026-10-04T16:00:00.000Z')).iso, '2026-10-05')
  assert.equal(formatDate(new Date('2019-11-12T15:28:32.000Z')).iso, '2019-11-12')
})

test('formatDate：空值和認不得的值回 null', () => {
  for (const v of [null, undefined, '', 'yesterday', new Date('x')]) assert.equal(formatDate(v), null)
})

test('dateFromPath：從文章網址取日期', () => {
  assert.equal(dateFromPath('/development/2022/01/10/install-nvm/'), '2022-01-10')
  assert.equal(dateFromPath('development/2026/10/05/security-habits/'), '2026-10-05')
  assert.equal(dateFromPath('/sass/2014/05/02/sass-3.3/'), '2014-05-02')
  assert.equal(dateFromPath('/about/'), '')
  assert.equal(dateFromPath(undefined), '')
})

test('readingText', () => {
  assert.equal(readingText(5), '5 分鐘閱讀')
  assert.equal(readingText('3'), '3 分鐘閱讀')
  assert.equal(readingText(1.4), '1 分鐘閱讀')
  assert.equal(readingText('約 5 分鐘'), '約 5 分鐘')
  for (const v of [null, undefined, '', 0, -2, NaN]) assert.equal(readingText(v), '')
})

test('longDate：跟列表頁卡片的日期格式相同', async () => {
  const { longDate } = await import('./format.mjs')
  assert.equal(longDate('2026-10-05'), '2026 年 10 月 05 日')
  assert.equal(longDate('2014-5-2'), '2014 年 05 月 02 日')
  assert.equal(longDate(null), '')
})

test('toHref：中文 percent-encode，大小寫和點照舊，已編碼的不再編碼', async () => {
  const { toHref } = await import('./format.mjs')
  assert.equal(toHref('/tags/資安/'), '/tags/%E8%B3%87%E5%AE%89/')
  assert.equal(toHref('/tags/%E8%B3%87%E5%AE%89/'), '/tags/%E8%B3%87%E5%AE%89/')
  assert.equal(toHref('/javascript/2019/03/18/JS-THIS/'), '/javascript/2019/03/18/JS-THIS/')
  assert.equal(toHref('/sass/2014/05/02/sass-3.3/'), '/sass/2014/05/02/sass-3.3/')
  assert.equal(toHref('/categories/CSS/'), '/categories/CSS/')
  assert.equal(toHref(undefined), '')
})
