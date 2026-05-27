import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import "@fontsource/cormorant-garamond";
import "@fontsource/montserrat";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type RecordData = {
  recorder: string;
  bpMorning: string;
  bpNight: string;
  pulse: string;
  spo2: string;
  temperature: string;
  weight: string;
  sleep: string;
  deepSleep: string;
  steps: string;
  activity: string;
  bowel: string;
  mood: string;
};

type HistoryItem = {
  id: string;
  date: string;
  data: RecordData;
};

type Medicine = {
  id: string;
  name: string;
  timing: string;
  stock: string;
  memo: string;
};

type Appointment = {
  id: string;
  date: string;
  time: string;
  hospital: string;
  purpose: string;
  memo: string;
};

type Visit = {
  id: string;
  date: string;
  hospital: string;
  department: string;
  reason: string;
  treatment: string;
  doctorComment: string;
  medicine: string;
};

type CycleRecord = {
  periodStart: string;
  cycleLength: string;
  bleeding: string;
  painScore: string;
  pmsSymptoms: string;
  moodScore: string;
  memo: string;
};

export default function App() {
  const [tab, setTab] = useState("home");
  const [recordMode, setRecordMode] = useState("vitals");
  const [clinicMode, setClinicMode] = useState("appointment");

  const defaultRecord: RecordData = {
    recorder: "本人",
    bpMorning: "112/68",
    bpNight: "118/72",
    pulse: "72",
    spo2: "98",
    temperature: "36.6",
    weight: "52.4",
    sleep: "6.5",
    deepSleep: "3",
    steps: "7420",
    activity: "48",
    bowel: "あり / 普通",
    mood: "62",
  };

  const defaultCycle: CycleRecord = {
    periodStart: "2026-05-09",
    cycleLength: "28",
    bleeding: "少量",
    painScore: "3",
    pmsSymptoms: "眠気、むくみ、気分の波",
    moodScore: "62",
    memo: "黄体期は睡眠不足で症状が強くなりやすい",
  };

  const defaultMedicines: Medicine[] = [
    {
      id: "1",
      name: "低用量ピル",
      timing: "毎日21:30",
      stock: "12錠",
      memo: "飲み忘れ注意",
    },
    {
      id: "2",
      name: "鉄剤",
      timing: "夕食後",
      stock: "18錠",
      memo: "胃部不快感に注意",
    },
  ];

  const defaultAppointments: Appointment[] = [
    {
      id: "1",
      date: "2026-06-03",
      time: "10:30",
      hospital: "婦人科クリニック",
      purpose: "PMS相談",
      memo: "前日20:00・当日8:00に通知予定",
    },
  ];

  const defaultVisits: Visit[] = [
    {
      id: "1",
      date: "2026-05-12",
      hospital: "婦人科クリニック",
      department: "婦人科",
      reason: "PMS・月経痛相談",
      treatment: "症状経過を確認。生活リズムと睡眠記録を継続。",
      doctorComment: "次周期も症状が強い場合は薬剤調整を検討。",
      medicine: "低用量ピル継続",
    },
  ];

  const [record, setRecord] = useState<RecordData>(() => {
    const saved = localStorage.getItem("mainichi-record");
    return saved ? JSON.parse(saved) : defaultRecord;
  });

  const [form, setForm] = useState<RecordData>(() => {
    const saved = localStorage.getItem("mainichi-record");
    return saved ? JSON.parse(saved) : defaultRecord;
  });

  const [cycle, setCycle] = useState<CycleRecord>(() => {
    const saved = localStorage.getItem("mainichi-cycle");
    return saved ? JSON.parse(saved) : defaultCycle;
  });

  const [cycleForm, setCycleForm] = useState<CycleRecord>(() => {
    const saved = localStorage.getItem("mainichi-cycle");
    return saved ? JSON.parse(saved) : defaultCycle;
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("mainichi-history");
    return saved ? JSON.parse(saved) : [];
  });

  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem("mainichi-medicines");
    return saved ? JSON.parse(saved) : defaultMedicines;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem("mainichi-appointments");
    return saved ? JSON.parse(saved) : defaultAppointments;
  });

  const [visits, setVisits] = useState<Visit[]>(() => {
    const saved = localStorage.getItem("mainichi-visits");
    return saved ? JSON.parse(saved) : defaultVisits;
  });

  const [medicineForm, setMedicineForm] = useState({
    name: "",
    timing: "",
    stock: "",
    memo: "",
  });

  const [appointmentForm, setAppointmentForm] = useState({
    date: "",
    time: "",
    hospital: "",
    purpose: "",
    memo: "",
  });

  const [visitForm, setVisitForm] = useState({
    date: "",
    hospital: "",
    department: "",
    reason: "",
    treatment: "",
    doctorComment: "",
    medicine: "",
  });

  useEffect(() => {
    async function loadRecords() {
      try {
        const q = query(collection(db, "records"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
  
        const firebaseHistory = snapshot.docs.map((doc) => {
          const data = doc.data();
  
          return {
            id: doc.id,
            date: data.date || "日付未登録",
            data: {
              recorder: data.recorder || "本人",
              bpMorning: data.bpMorning || "",
              bpNight: data.bpNight || "",
              pulse: data.pulse || "",
              spo2: data.spo2 || "",
              temperature: data.temperature || "",
              weight: data.weight || "",
              sleep: data.sleep || "",
              deepSleep: data.deepSleep || "",
              steps: data.steps || "",
              activity: data.activity || "",
              bowel: data.bowel || "",
              mood: data.mood || "",
            },
          };
        });
  
        if (firebaseHistory.length > 0) {
          setHistory(firebaseHistory);
          setRecord(firebaseHistory[0].data);
          setForm(firebaseHistory[0].data);
        }
      } catch (error) {
        console.error("Firebase読み込みエラー", error);
      }
    }
  
    loadRecords();
  }, []);

  async function saveRecord() {
    const today = new Date().toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
    });

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: today,
      data: form,
    };

    const next = [newItem, ...history];

    setRecord(form);
    setHistory(next);

    localStorage.setItem("mainichi-record", JSON.stringify(form));
    localStorage.setItem("mainichi-history", JSON.stringify(next));

    try {
      await addDoc(collection(db, "records"), {
        createdAt: new Date(),
        date: today,
        ...form,
      });

      alert("Firebaseへ保存しました");
    } catch (error) {
      console.error(error);
      alert("Firebase保存エラー。localStorageには保存しました。");
    }
  }

  function saveCycle() {
    setCycle(cycleForm);
    localStorage.setItem("mainichi-cycle", JSON.stringify(cycleForm));
    alert("生理周期・PMS記録を保存しました");
  }

  function addMedicine() {
    if (!medicineForm.name) {
      alert("薬名を入力してください");
      return;
    }

    const newMedicine: Medicine = {
      id: Date.now().toString(),
      name: medicineForm.name,
      timing: medicineForm.timing || "未設定",
      stock: medicineForm.stock || "未設定",
      memo: medicineForm.memo || "",
    };

    const next = [newMedicine, ...medicines];

    setMedicines(next);
    localStorage.setItem("mainichi-medicines", JSON.stringify(next));

    setMedicineForm({
      name: "",
      timing: "",
      stock: "",
      memo: "",
    });
  }

  function deleteMedicine(id: string) {
    if (!confirm("このお薬を削除しますか？")) return;

    const next = medicines.filter((item) => item.id !== id);
    setMedicines(next);
    localStorage.setItem("mainichi-medicines", JSON.stringify(next));
  }

  function addAppointment() {
    if (!appointmentForm.date || !appointmentForm.hospital) {
      alert("受診日と病院名を入力してください");
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      date: appointmentForm.date,
      time: appointmentForm.time || "未設定",
      hospital: appointmentForm.hospital,
      purpose: appointmentForm.purpose || "未設定",
      memo: appointmentForm.memo || "",
    };

    const next = [newAppointment, ...appointments];

    setAppointments(next);
    localStorage.setItem("mainichi-appointments", JSON.stringify(next));

    setAppointmentForm({
      date: "",
      time: "",
      hospital: "",
      purpose: "",
      memo: "",
    });
  }

  function deleteAppointment(id: string) {
    if (!confirm("この受診予約を削除しますか？")) return;

    const next = appointments.filter((item) => item.id !== id);
    setAppointments(next);
    localStorage.setItem("mainichi-appointments", JSON.stringify(next));
  }

  function addVisit() {
    if (!visitForm.date || !visitForm.hospital) {
      alert("受診日と病院名を入力してください");
      return;
    }

    const newVisit: Visit = {
      id: Date.now().toString(),
      date: visitForm.date,
      hospital: visitForm.hospital,
      department: visitForm.department || "未設定",
      reason: visitForm.reason || "未設定",
      treatment: visitForm.treatment || "",
      doctorComment: visitForm.doctorComment || "",
      medicine: visitForm.medicine || "",
    };

    const next = [newVisit, ...visits];

    setVisits(next);
    localStorage.setItem("mainichi-visits", JSON.stringify(next));

    setVisitForm({
      date: "",
      hospital: "",
      department: "",
      reason: "",
      treatment: "",
      doctorComment: "",
      medicine: "",
    });
  }

  function deleteVisit(id: string) {
    if (!confirm("この受診歴を削除しますか？")) return;

    const next = visits.filter((item) => item.id !== id);
    setVisits(next);
    localStorage.setItem("mainichi-visits", JSON.stringify(next));
  }

  function printHospitalCard() {
    window.print();
  }

  const graphData = [...history].reverse().map((item) => ({
    date: item.date,
    temperature: Number(item.data.temperature),
    mood: Number(item.data.mood),
    systolic: Number(item.data.bpMorning.split("/")[0]),
  }));

  const periodDay = Number(cycle.periodStart.split("-")[2]);
  const appointmentDays = appointments
    .map((item) => Number(item.date.split("-")[2]))
    .filter((day) => !Number.isNaN(day));

  return (
    <div style={styles.page}>
      <header style={styles.header} className="no-print">
        <p style={styles.small}>PERSONAL HEALTH ARCHIVE</p>
        <h1 style={styles.title}>Wellness Record</h1>
        <p style={styles.notice}>
          PMSピーク予測です。今日は予定を少し軽めにして、休息を優先しましょう。
        </p>
      </header>

      <main style={styles.main}>
        {tab === "home" && (
          <>
            <Card title="今日のコンディション">
              <div style={styles.summaryGrid}>
                <Mini label="血圧" value={record.bpMorning} />
                <Mini label="体温" value={`${record.temperature}℃`} />
                <Mini label="睡眠" value={`${record.sleep}h`} />
                <Mini label="気分" value={`${record.mood}/100`} />
              </div>
              <p style={styles.recorderText}>最終記録者：{record.recorder}</p>
            </Card>

            <Card title="生理周期・PMS">
              <p>生理開始日：{cycle.periodStart}</p>
              <p>周期：{cycle.cycleLength}日</p>
              <p>PMS：{cycle.pmsSymptoms}</p>
              <p>
                痛み：{cycle.painScore}/10　気分：{cycle.moodScore}/100
              </p>
            </Card>

            <Card title="次の受診予約">
              {appointments.slice(0, 2).map((item) => (
                <div key={item.id} style={styles.softItem}>
                  <p style={styles.goldText}>
                    {item.date} {item.time}
                  </p>
                  <p style={styles.bold}>{item.hospital}</p>
                  <p>{item.purpose}</p>
                </div>
              ))}
            </Card>

            <Card title="今日のお薬">
              {medicines.slice(0, 3).map((item) => (
                <div key={item.id} style={styles.softItem}>
                  <p style={styles.bold}>{item.name}</p>
                  <p>
                    {item.timing} / 残数：{item.stock}
                  </p>
                </div>
              ))}
            </Card>
          </>
        )}

        {tab === "record" && (
          <>
            <Segment
              value={recordMode}
              onChange={setRecordMode}
              items={[
                ["vitals", "基本記録"],
                ["cycle", "周期"],
                ["history", "履歴"],
              ]}
            />

            {recordMode === "vitals" && (
              <Card title="今日の記録">
                <Input
                  label="記録者"
                  value={form.recorder}
                  onChange={(v: string) => setForm({ ...form, recorder: v })}
                />
                <Input
                  label="血圧 朝"
                  value={form.bpMorning}
                  onChange={(v: string) => setForm({ ...form, bpMorning: v })}
                />
                <Input
                  label="血圧 夜"
                  value={form.bpNight}
                  onChange={(v: string) => setForm({ ...form, bpNight: v })}
                />
                <Input
                  label="脈拍"
                  value={form.pulse}
                  onChange={(v: string) => setForm({ ...form, pulse: v })}
                />
                <Input
                  label="SpO₂"
                  value={form.spo2}
                  onChange={(v: string) => setForm({ ...form, spo2: v })}
                />
                <Input
                  label="体温"
                  value={form.temperature}
                  onChange={(v: string) =>
                    setForm({ ...form, temperature: v })
                  }
                />
                <Input
                  label="体重"
                  value={form.weight}
                  onChange={(v: string) => setForm({ ...form, weight: v })}
                />
                <Input
                  label="睡眠時間"
                  value={form.sleep}
                  onChange={(v: string) => setForm({ ...form, sleep: v })}
                />
                <Input
                  label="熟眠感 1〜5"
                  value={form.deepSleep}
                  onChange={(v: string) => setForm({ ...form, deepSleep: v })}
                />
                <Input
                  label="歩数"
                  value={form.steps}
                  onChange={(v: string) => setForm({ ...form, steps: v })}
                />
                <Input
                  label="活動量 分"
                  value={form.activity}
                  onChange={(v: string) => setForm({ ...form, activity: v })}
                />
                <Input
                  label="排便記録"
                  value={form.bowel}
                  onChange={(v: string) => setForm({ ...form, bowel: v })}
                />
                <Input
                  label="気分スコア 0〜100"
                  value={form.mood}
                  onChange={(v: string) => setForm({ ...form, mood: v })}
                />

                <button style={styles.mainButton} onClick={saveRecord}>
                  保存する
                </button>
              </Card>
            )}

            {recordMode === "cycle" && (
              <>
                <Card title="生理周期・PMS記録">
                  <Input
                    label="生理開始日"
                    type="date"
                    value={cycleForm.periodStart}
                    onChange={(v: string) =>
                      setCycleForm({ ...cycleForm, periodStart: v })
                    }
                  />
                  <Input
                    label="周期日数"
                    value={cycleForm.cycleLength}
                    onChange={(v: string) =>
                      setCycleForm({ ...cycleForm, cycleLength: v })
                    }
                  />
                  <Input
                    label="出血量"
                    value={cycleForm.bleeding}
                    onChange={(v: string) =>
                      setCycleForm({ ...cycleForm, bleeding: v })
                    }
                  />
                  <Input
                    label="痛みスコア 0〜10"
                    value={cycleForm.painScore}
                    onChange={(v: string) =>
                      setCycleForm({ ...cycleForm, painScore: v })
                    }
                  />
                  <Input
                    label="PMS症状"
                    value={cycleForm.pmsSymptoms}
                    onChange={(v: string) =>
                      setCycleForm({ ...cycleForm, pmsSymptoms: v })
                    }
                  />
                  <Input
                    label="気分スコア 0〜100"
                    value={cycleForm.moodScore}
                    onChange={(v: string) =>
                      setCycleForm({ ...cycleForm, moodScore: v })
                    }
                  />
                  <Input
                    label="メモ"
                    value={cycleForm.memo}
                    onChange={(v: string) =>
                      setCycleForm({ ...cycleForm, memo: v })
                    }
                  />

                  <button style={styles.mainButton} onClick={saveCycle}>
                    周期・PMSを保存
                  </button>
                </Card>

                <Card title="現在の周期メモ">
                  <p>生理開始日：{cycle.periodStart}</p>
                  <p>周期：{cycle.cycleLength}日</p>
                  <p>出血量：{cycle.bleeding}</p>
                  <p>痛み：{cycle.painScore}/10</p>
                  <p>PMS：{cycle.pmsSymptoms}</p>
                  <p>気分：{cycle.moodScore}/100</p>
                  <p>メモ：{cycle.memo}</p>
                </Card>
              </>
            )}

            {recordMode === "history" && (
              <Card title="記録履歴">
                {history.length === 0 && <p>まだ記録がありません。</p>}

                {history.map((item) => (
                  <div key={item.id} style={styles.softItem}>
                    <p style={styles.goldText}>{item.date}</p>
                    <p style={styles.bold}>記録者：{item.data.recorder}</p>
                    <p>血圧：{item.data.bpMorning}</p>
                    <p>体温：{item.data.temperature}℃</p>
                    <p>体重：{item.data.weight}kg</p>
                    <p>気分：{item.data.mood}/100</p>
                  </div>
                ))}
              </Card>
            )}
          </>
        )}

        {tab === "clinic" && (
          <>
            <Segment
              value={clinicMode}
              onChange={setClinicMode}
              items={[
                ["appointment", "予約"],
                ["visit", "受診歴"],
                ["medicine", "お薬"],
              ]}
            />

            {clinicMode === "appointment" && (
              <>
                <Card title="受診予約を追加">
                  <Input
                    label="受診日"
                    type="date"
                    value={appointmentForm.date}
                    onChange={(v: string) =>
                      setAppointmentForm({ ...appointmentForm, date: v })
                    }
                  />
                  <Input
                    label="時間"
                    type="time"
                    value={appointmentForm.time}
                    onChange={(v: string) =>
                      setAppointmentForm({ ...appointmentForm, time: v })
                    }
                  />
                  <Input
                    label="病院名"
                    value={appointmentForm.hospital}
                    onChange={(v: string) =>
                      setAppointmentForm({ ...appointmentForm, hospital: v })
                    }
                  />
                  <Input
                    label="受診目的"
                    value={appointmentForm.purpose}
                    onChange={(v: string) =>
                      setAppointmentForm({ ...appointmentForm, purpose: v })
                    }
                  />
                  <Input
                    label="メモ"
                    value={appointmentForm.memo}
                    onChange={(v: string) =>
                      setAppointmentForm({ ...appointmentForm, memo: v })
                    }
                  />

                  <button style={styles.mainButton} onClick={addAppointment}>
                    受診予約を追加
                  </button>
                </Card>

                <Card title="受診予約一覧">
                  {appointments.map((item) => (
                    <div key={item.id} style={styles.softItem}>
                      <p style={styles.goldText}>
                        {item.date} {item.time}
                      </p>
                      <p style={styles.bold}>{item.hospital}</p>
                      <p>{item.purpose}</p>
                      {item.memo && <p>メモ：{item.memo}</p>}
                      <button
                        style={styles.deleteButton}
                        onClick={() => deleteAppointment(item.id)}
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </Card>
              </>
            )}

            {clinicMode === "visit" && (
              <>
                <Card title="受診歴を追加">
                  <Input
                    label="受診日"
                    type="date"
                    value={visitForm.date}
                    onChange={(v: string) =>
                      setVisitForm({ ...visitForm, date: v })
                    }
                  />
                  <Input
                    label="病院名"
                    value={visitForm.hospital}
                    onChange={(v: string) =>
                      setVisitForm({ ...visitForm, hospital: v })
                    }
                  />
                  <Input
                    label="診療科"
                    value={visitForm.department}
                    onChange={(v: string) =>
                      setVisitForm({ ...visitForm, department: v })
                    }
                  />
                  <Input
                    label="相談内容"
                    value={visitForm.reason}
                    onChange={(v: string) =>
                      setVisitForm({ ...visitForm, reason: v })
                    }
                  />
                  <Input
                    label="処置・検査・結果"
                    value={visitForm.treatment}
                    onChange={(v: string) =>
                      setVisitForm({ ...visitForm, treatment: v })
                    }
                  />
                  <Input
                    label="医師コメント"
                    value={visitForm.doctorComment}
                    onChange={(v: string) =>
                      setVisitForm({ ...visitForm, doctorComment: v })
                    }
                  />
                  <Input
                    label="処方・薬メモ"
                    value={visitForm.medicine}
                    onChange={(v: string) =>
                      setVisitForm({ ...visitForm, medicine: v })
                    }
                  />

                  <button style={styles.mainButton} onClick={addVisit}>
                    受診歴を追加
                  </button>
                </Card>

                <Card title="受診歴一覧">
                  {visits.map((item) => (
                    <div key={item.id} style={styles.softItem}>
                      <p style={styles.goldText}>{item.date}</p>
                      <p style={styles.bold}>
                        {item.hospital} / {item.department}
                      </p>
                      <p>相談内容：{item.reason}</p>
                      {item.treatment && <p>処置・検査：{item.treatment}</p>}
                      {item.doctorComment && (
                        <p>医師コメント：{item.doctorComment}</p>
                      )}
                      {item.medicine && <p>処方・薬：{item.medicine}</p>}
                      <button
                        style={styles.deleteButton}
                        onClick={() => deleteVisit(item.id)}
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </Card>
              </>
            )}

            {clinicMode === "medicine" && (
              <>
                <Card title="お薬を追加">
                  <Input
                    label="薬名"
                    value={medicineForm.name}
                    onChange={(v: string) =>
                      setMedicineForm({ ...medicineForm, name: v })
                    }
                  />
                  <Input
                    label="飲むタイミング"
                    value={medicineForm.timing}
                    onChange={(v: string) =>
                      setMedicineForm({ ...medicineForm, timing: v })
                    }
                  />
                  <Input
                    label="残数"
                    value={medicineForm.stock}
                    onChange={(v: string) =>
                      setMedicineForm({ ...medicineForm, stock: v })
                    }
                  />
                  <Input
                    label="メモ"
                    value={medicineForm.memo}
                    onChange={(v: string) =>
                      setMedicineForm({ ...medicineForm, memo: v })
                    }
                  />

                  <button style={styles.mainButton} onClick={addMedicine}>
                    お薬を追加
                  </button>
                </Card>

                <Card title="お薬一覧">
                  {medicines.map((item) => (
                    <div key={item.id} style={styles.softItem}>
                      <p style={styles.bold}>{item.name}</p>
                      <p>
                        {item.timing} / 残数：{item.stock}
                      </p>
                      {item.memo && <p>メモ：{item.memo}</p>}
                      <button
                        style={styles.deleteButton}
                        onClick={() => deleteMedicine(item.id)}
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </Card>
              </>
            )}
          </>
        )}

        {tab === "report" && (
          <>
            <Card title="健康カレンダー">
              <div style={styles.simpleCalendar}>
                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  const hasAppointment = appointmentDays.includes(day);
                  const isPeriod = day === periodDay;

                  return (
                    <div key={day} style={styles.calendarDay}>
                      <div style={styles.calendarNumber}>{day}</div>
                      <div style={styles.calendarDots}>
                        {hasAppointment && <div style={styles.dotGold} />}
                        {isPeriod && <div style={styles.dotPink} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 16 }}>
                <p>
                  <span style={styles.legendGold}></span>
                  受診予約
                </p>
                <p>
                  <span style={styles.legendPink}></span>
                  生理開始日
                </p>
              </div>
            </Card>

            <GraphCard title="体温推移" data={graphData} dataKey="temperature" />
            <GraphCard title="気分スコア推移" data={graphData} dataKey="mood" />
            <GraphCard title="血圧推移（上）" data={graphData} dataKey="systolic" />

            <Card title="病院提出モード">
              <button style={styles.mainButton} onClick={printHospitalCard}>
                病院提出用に印刷 / PDF保存
              </button>
            </Card>

            <section style={styles.submitCard}>
              <h2 style={styles.submitTitle}>病院提出用サマリー</h2>
              <p style={styles.submitSub}>Wellness Record</p>

              <Block title="月経周期・PMS">
                <p>生理開始日：{cycle.periodStart}</p>
                <p>周期：{cycle.cycleLength}日</p>
                <p>出血量：{cycle.bleeding}</p>
                <p>痛み：{cycle.painScore}/10</p>
                <p>PMS：{cycle.pmsSymptoms}</p>
                <p>気分：{cycle.moodScore}/100</p>
                <p>メモ：{cycle.memo}</p>
              </Block>

              <Block title="バイタル">
                <p>記録者：{record.recorder}</p>
                <p>血圧 朝：{record.bpMorning} mmHg</p>
                <p>血圧 夜：{record.bpNight} mmHg</p>
                <p>脈拍：{record.pulse} 回/分</p>
                <p>SpO₂：{record.spo2}%</p>
                <p>体温：{record.temperature}℃</p>
                <p>体重：{record.weight}kg</p>
              </Block>

              <Block title="服薬">
                {medicines.map((item) => (
                  <p key={item.id}>
                    {item.name}：{item.timing} / 残数 {item.stock}
                    {item.memo ? ` / ${item.memo}` : ""}
                  </p>
                ))}
              </Block>

              <Block title="受診予約">
                {appointments.map((item) => (
                  <p key={item.id}>
                    {item.date} {item.time} / {item.hospital} / {item.purpose}
                  </p>
                ))}
              </Block>

              <Block title="受診歴">
                {visits.map((item) => (
                  <div key={item.id} style={styles.printVisit}>
                    <p>
                      {item.date} / {item.hospital} / {item.department}
                    </p>
                    <p>相談内容：{item.reason}</p>
                    {item.treatment && <p>処置・検査：{item.treatment}</p>}
                    {item.doctorComment && (
                      <p>医師コメント：{item.doctorComment}</p>
                    )}
                    {item.medicine && <p>処方・薬：{item.medicine}</p>}
                  </div>
                ))}
              </Block>
            </section>
          </>
        )}
      </main>

      <nav style={styles.bottomNav} className="no-print">
        {[
          ["home", "ホーム", "⌂"],
          ["record", "記録", "＋"],
          ["clinic", "通院", "♢"],
          ["report", "提出", "▣"],
        ].map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={tab === key ? styles.bottomActive : styles.bottomButton}
          >
            <span style={styles.bottomIcon}>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <style>
        {`
          @media print {
            body { background: white; }
            .no-print { display: none !important; }
            section { box-shadow: none !important; }
          }
        `}
      </style>
    </div>
  );
}

function Card({ title, children }: any) {
  return (
    <section style={styles.card}>
      <h2 style={styles.cardTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Block({ title, children }: any) {
  return (
    <div style={styles.block}>
      <h3 style={styles.blockTitle}>{title}</h3>
      {children}
    </div>
  );
}

function Mini({ label, value }: any) {
  return (
    <div style={styles.mini}>
      <p style={styles.miniLabel}>{label}</p>
      <p style={styles.miniValue}>{value}</p>
    </div>
  );
}

function Segment({ value, onChange, items }: any) {
  return (
    <div style={styles.segment}>
      {items.map(([key, label]: any) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={value === key ? styles.segmentActive : styles.segmentButton}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: any) {
  return (
    <label style={styles.inputLabel}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
    </label>
  );
}

function GraphCard({ title, data, dataKey }: any) {
  return (
    <Card title={title}>
      {data.length === 0 ? (
        <p>記録を保存するとグラフが表示されます。</p>
      ) : (
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="#9f7e47"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f7f1ea 0%, #fffaf6 45%, #f8efe8 100%)",
    padding: 16,
    paddingBottom: 98,
    fontFamily: "Georgia, 'Hiragino Mincho ProN', 'Yu Mincho', serif",
    color: "#332b26",
    maxWidth: 540,
    margin: "0 auto",
  },
  main: {
    paddingBottom: 20,
  },
  header: {
    background:
      "linear-gradient(135deg, #2f241f 0%, #6f5747 48%, #d8bd8f 100%)",
    color: "white",
    padding: 24,
    borderRadius: 30,
    marginBottom: 16,
    boxShadow: "0 18px 35px rgba(70, 49, 37, 0.22)",
  },
  small: {
    color: "#f4dfb6",
    fontSize: 11,
    margin: 0,
    letterSpacing: 4,
    textTransform: "uppercase",
    fontFamily: "'Montserrat', sans-serif",
  },
  title: {
    margin: "10px 0 14px",
    fontSize: 38,
    letterSpacing: 2,
    fontWeight: 300,
    color: "#fffaf3",
    fontFamily: "'Cormorant Garamond', serif",
  },
  notice: {
    background: "rgba(255,255,255,0.14)",
    color: "#fff7ed",
    padding: 14,
    borderRadius: 20,
    fontSize: 14,
    lineHeight: 1.7,
    border: "1px solid rgba(255,255,255,0.22)",
  },
  bottomNav: {
    position: "fixed",
    left: "50%",
    bottom: 14,
    transform: "translateX(-50%)",
    width: "calc(100% - 28px)",
    maxWidth: 520,
    background: "rgba(47,36,31,0.96)",
    border: "1px solid #b08a55",
    borderRadius: 26,
    padding: 8,
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 6,
    boxShadow: "0 16px 35px rgba(45,30,20,0.28)",
  },
  bottomButton: {
    border: "none",
    background: "transparent",
    color: "#e7d4bd",
    borderRadius: 20,
    padding: "8px 4px",
    fontWeight: 700,
    fontSize: 12,
  },
  bottomActive: {
    border: "none",
    background: "linear-gradient(135deg, #fff1d6, #b08a55)",
    color: "#33251f",
    borderRadius: 20,
    padding: "8px 4px",
    fontWeight: 800,
    fontSize: 12,
  },
  bottomIcon: {
    display: "block",
    fontSize: 17,
    lineHeight: 1,
    marginBottom: 3,
  },
  segment: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 6,
    background: "rgba(255,255,255,0.7)",
    border: "1px solid #eadcc9",
    borderRadius: 20,
    padding: 6,
    marginBottom: 14,
  },
  segmentButton: {
    border: "none",
    borderRadius: 16,
    background: "transparent",
    color: "#6b5a4d",
    padding: "10px 6px",
    fontWeight: 700,
  },
  segmentActive: {
    border: "none",
    borderRadius: 16,
    background: "#33251f",
    color: "#f7e7c8",
    padding: "10px 6px",
    fontWeight: 800,
  },
  card: {
    background: "rgba(255,255,255,0.9)",
    padding: 20,
    borderRadius: 28,
    marginBottom: 14,
    boxShadow: "0 14px 30px rgba(98, 74, 55, 0.08)",
    border: "1px solid rgba(211, 188, 154, 0.45)",
  },
  cardTitle: {
    fontSize: 19,
    marginTop: 0,
    color: "#3b2d25",
    borderBottom: "1px solid #eadcc9",
    paddingBottom: 10,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  mini: {
    background: "linear-gradient(135deg, #fffaf3, #f6eee4)",
    border: "1px solid #eadcc9",
    borderRadius: 20,
    padding: 14,
  },
  miniLabel: {
    margin: 0,
    color: "#8b735d",
    fontSize: 12,
  },
  miniValue: {
    margin: "5px 0 0",
    fontWeight: 700,
    fontSize: 18,
  },
  recorderText: {
    color: "#8b735d",
    fontSize: 13,
    marginBottom: 0,
  },
  inputLabel: {
    display: "block",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#5e4b3f",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    marginTop: 6,
    padding: 13,
    borderRadius: 16,
    border: "1px solid #e2d2bd",
    background: "#fffdf9",
    fontSize: 16,
    color: "#332b26",
  },
  mainButton: {
    background: "linear-gradient(135deg, #3b2d25, #9f7e47)",
    color: "white",
    border: "none",
    padding: "15px 18px",
    borderRadius: 18,
    width: "100%",
    fontWeight: "bold",
    marginBottom: 14,
    boxShadow: "0 10px 20px rgba(72, 48, 34, 0.18)",
  },
  deleteButton: {
    background: "#fff7f4",
    color: "#9f4b3f",
    border: "1px solid #edd0c6",
    padding: "10px 14px",
    borderRadius: 14,
    fontWeight: "bold",
    marginTop: 8,
  },
  softItem: {
    background: "linear-gradient(135deg, #fffaf3, #f7efe7)",
    border: "1px solid #eadcc9",
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  bold: {
    fontWeight: 700,
    margin: "0 0 4px",
  },
  goldText: {
    color: "#9f7e47",
    fontWeight: 700,
    margin: "0 0 4px",
  },
  simpleCalendar: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 8,
  },
  calendarDay: {
    background: "#fffaf3",
    border: "1px solid #eadcc9",
    borderRadius: 16,
    padding: 10,
    minHeight: 58,
  },
  calendarNumber: {
    fontWeight: 700,
    color: "#5e4b3f",
    marginBottom: 8,
  },
  calendarDots: {
    display: "flex",
    gap: 4,
  },
  dotGold: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "#b48a4f",
  },
  dotPink: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "#ec4899",
  },
  legendGold: {
    display: "inline-block",
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#b48a4f",
    marginRight: 8,
  },
  legendPink: {
    display: "inline-block",
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#ec4899",
    marginRight: 8,
  },
  submitCard: {
    background: "white",
    padding: 24,
    borderRadius: 22,
    marginBottom: 14,
    border: "1px solid #eadcc9",
  },
  submitTitle: {
    fontSize: 25,
    margin: 0,
  },
  submitSub: {
    color: "#9f7e47",
    marginTop: 4,
  },
  block: {
    borderTop: "1px solid #eadcc9",
    paddingTop: 12,
    marginTop: 12,
  },
  blockTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  printVisit: {
    marginBottom: 10,
  },
};
