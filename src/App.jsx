import React from 'react';
import {
  Activity,
  Check,
  ClipboardList,
  Disc3,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  Trophy,
  UserRound
} from 'lucide-react';
import { useMemo, useState } from 'react';

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

const STUDENT_NAMES = [
 '강승현',
  '고연재',
  '권능',
  '김건',
  '김도현',
  '김빛가람',
  '김연우',
  '김현준',
  '박로니',
  '박하연',
  '방로하',
  '손유호',
  '신태현',
  '안이현',
  '오지민',
  '이다현',
  '이상율',
  '이종찬',
  '정비아',
  '조태현',
  '조하빈',
  '지현진',
  '진주',
  '홍백현',
  '홍세민',
  '직접 입력'
];

const ACTIVITIES = [
  { id: 'pass', label: '친구에게 패스하기' },
  { id: 'catch', label: '캐치 기술 익히기' },
  { id: 'miniGame', label: '팀 경기하기' },
  { id: 'strategy', label: '새로운 기술 해보기' },
  { id: 'league', label: '친구 도와주기' },
  { id: 'free', label: '스스로 연습하기' }
];

const REFLECTIONS = [
  { id: 'cooperation', label: '친구와 협력했어요' },
  { id: 'participation', label: '끝까지 참여했어요' },
  { id: 'cheering', label: '친구를 응원했어요' },
  { id: 'rules', label: '규칙을 잘 지켰어요' },
  { id: 'selfPractice', label: '스스로 연습했어요' }
];

const MOODS = [
  { score: 4, icon: '😀', text: '아주 좋아요' },
  { score: 3, icon: '🙂', text: '좋아요' },
  { score: 2, icon: '😐', text: '보통이에요' },
  { score: 1, icon: '😢', text: '아쉬워요' }
];

function createInitialReflection() {
  return Object.fromEntries(REFLECTIONS.map((item) => [item.id, 3]));
}

function getKoreanDate() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
}

function makeSubmissionId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function classNames(...items) {
  return items.filter(Boolean).join(' ');
}

function callAppsScript(payload) {
  return submitWithHiddenForm(payload);
}

function submitWithHiddenForm(payload) {
  return new Promise((resolve, reject) => {
    const frameName = `flyUpFrame_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const iframe = document.createElement('iframe');
    const form = document.createElement('form');
    const input = document.createElement('input');
    let submitted = false;

    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('Apps Script 제출 시간이 초과되었습니다.'));
    }, 15000);

    function cleanup() {
      window.clearTimeout(timeoutId);
      form.remove();
      iframe.remove();
    }

    iframe.name = frameName;
    iframe.style.display = 'none';
    iframe.onload = () => {
      if (!submitted) return;
      cleanup();
      resolve({ ok: true });
    };

    form.method = 'POST';
    form.action = APPS_SCRIPT_URL;
    form.target = frameName;
    form.style.display = 'none';

    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(payload);

    form.appendChild(input);
    document.body.appendChild(iframe);
    document.body.appendChild(form);

    submitted = true;
    form.submit();
  });
}

export default function App() {
  const [selectedName, setSelectedName] = useState('');
  const [customName, setCustomName] = useState('');
  const [activities, setActivities] = useState([]);
  const [reflection, setReflection] = useState(createInitialReflection);
  const [memo, setMemo] = useState('');
  const [status, setStatus] = useState('준비 완료');
  const [isSaving, setIsSaving] = useState(false);
  const [recentRecords, setRecentRecords] = useState([]);

  const studentName = selectedName === '직접 입력' ? customName.trim() : selectedName;

  const reflectionAverage = useMemo(() => {
    const values = Object.values(reflection).map(Number);
    return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
  }, [reflection]);

  const selectedActivityLabels = useMemo(
    () => ACTIVITIES.filter((item) => activities.includes(item.id)).map((item) => item.label),
    [activities]
  );

  function toggleActivity(activityId) {
    setActivities((current) =>
      current.includes(activityId)
        ? current.filter((id) => id !== activityId)
        : [...current, activityId]
    );
  }

  function resetForm() {
    setActivities([]);
    setReflection(createInitialReflection());
    setMemo('');
  }

  async function saveRecord() {
    if (!APPS_SCRIPT_URL) {
      setStatus('.env 파일에 VITE_APPS_SCRIPT_URL을 넣어 주세요.');
      return;
    }

    if (!studentName) {
      setStatus('이름을 선택하거나 직접 입력해 주세요.');
      return;
    }

    if (activities.length === 0) {
      setStatus('오늘 한 활동을 하나 이상 선택해 주세요.');
      return;
    }

    const record = {
      submissionId: makeSubmissionId(),
      submittedAt: new Date().toISOString(),
      date: getKoreanDate(),
      studentName,
      activities: selectedActivityLabels,
      reflection,
      reflectionAverage,
      memo: memo.trim()
    };

    setIsSaving(true);
    setStatus('Google Sheets로 저장 요청을 보내는 중입니다.');

    try {
      const body = {
        apiVersion: '2026-05-27',
        action: 'createGrowthRecord',
        record
      };

      await callAppsScript(body);

      setRecentRecords((current) => [record, ...current].slice(0, 3));
      resetForm();
      setStatus('Google Sheets 저장 완료.');
    } catch (error) {
      setStatus(`저장 요청 실패: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6faf8] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <section className="relative overflow-hidden bg-teal-700 px-5 pb-8 pt-6 text-white">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border-[18px] border-white/15" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold text-teal-100">플라잉디스크 성장 포트폴리오</p>
              <h1 className="mt-2 text-4xl font-black leading-tight tracking-normal">
                Fly-Up
                <br />
                성장기록장
              </h1>
            </div>
            <div className="rounded-2xl bg-white/14 p-3">
              <Disc3 size={42} />
            </div>
          </div>
          <div className="relative mt-5 inline-flex rounded-full bg-white/16 px-3 py-2 text-sm font-extrabold">
            {getKoreanDate()} 오늘의 기록
          </div>
        </section>

        <section className="-mt-4 flex-1 rounded-t-[28px] bg-[#f6faf8] px-4 pb-28 pt-5">
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard icon={Trophy} label="성찰 평균" value={reflectionAverage} />
            <SummaryCard icon={Activity} label="선택 활동" value={`${activities.length}개`} />
          </div>

          <Card title="내 이름" icon={UserRound}>
            <select
              value={selectedName}
              onChange={(event) => setSelectedName(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-bold outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            >
              <option value="">이름을 선택해요</option>
              {STUDENT_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {selectedName === '직접 입력' && (
              <input
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                placeholder="이름을 입력해요"
                className="mt-3 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-bold outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              />
            )}
          </Card>

          <Card title="오늘 활동" icon={ClipboardList}>
            <div className="grid grid-cols-2 gap-2">
              {ACTIVITIES.map((activity) => {
                const selected = activities.includes(activity.id);
                return (
                  <button
                    type="button"
                    key={activity.id}
                    onClick={() => toggleActivity(activity.id)}
                    className={classNames(
                      'flex min-h-14 items-center justify-between rounded-xl border px-3 text-left text-sm font-black transition',
                      selected
                        ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700'
                    )}
                  >
                    {activity.label}
                    {selected && <Check size={18} />}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="자기성찰" icon={Sparkles}>
            <div className="space-y-4">
              {REFLECTIONS.map((item) => (
                <div key={item.id} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-black text-slate-800">{item.label}</p>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {MOODS.map((mood) => (
                      <button
                        type="button"
                        key={mood.score}
                        title={mood.text}
                        onClick={() =>
                          setReflection((current) => ({
                            ...current,
                            [item.id]: mood.score
                          }))
                        }
                        className={classNames(
                          'h-12 rounded-xl border bg-white text-2xl transition',
                          reflection[item.id] === mood.score
                            ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-500/15'
                            : 'border-slate-200'
                        )}
                      >
                        {mood.icon}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="느낀점" icon={MessageCircle}>
            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="오늘 잘한 점, 친구와 함께한 장면, 다음에 더 연습하고 싶은 점을 적어 봐요."
              className="min-h-32 w-full rounded-xl border border-slate-200 bg-white p-3 text-base leading-6 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            />
          </Card>

          {recentRecords.length > 0 && (
            <Card title="방금 보낸 기록" icon={Check}>
              <div className="space-y-2">
                {recentRecords.map((record) => (
                  <div key={record.submissionId} className="rounded-xl bg-teal-50 p-3">
                    <p className="font-black text-teal-950">
                      {record.studentName} · 성찰 {record.reflectionAverage}
                    </p>
                    <p className="mt-1 text-sm font-bold text-teal-800">
                      {record.activities.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </section>

        <footer className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
          <button
            type="button"
            onClick={saveRecord}
            disabled={isSaving}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 text-base font-black text-white shadow-[0_14px_30px_rgba(15,118,110,0.24)] disabled:bg-slate-400 disabled:shadow-none"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            {isSaving ? '저장 중...' : '성장 기록 저장'}
          </button>
          <p className="mt-2 text-center text-xs font-bold text-slate-500">{status}</p>
          {APPS_SCRIPT_URL && (
            <a
              href={APPS_SCRIPT_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-center text-xs font-black text-teal-700 underline"
            >
              Apps Script 연결 확인
            </a>
          )}
        </footer>
      </div>
    </main>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-black text-slate-500">
        <Icon size={17} />
        {label}
      </div>
      <div className="mt-2 text-2xl font-black text-slate-950">{value}</div>
    </div>
  );
}

function Card({ title, icon: Icon, children }) {
  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-slate-950">
        <Icon size={20} className="text-teal-700" />
        {title}
      </h2>
      {children}
    </section>
  );
}
