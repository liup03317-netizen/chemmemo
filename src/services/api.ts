import { v4 as uuidv4 } from 'uuid';

const DB_KEY = 'chemmemo-mock-db';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_emoji: string;
}

interface Class {
  id: string;
  teacher_id: string;
  join_code: string;
  name: string;
  created_at: string;
}

interface ClassMember {
  class_id: string;
  student_id: string;
  joined_at: string;
}

interface StudentProgress {
  student_id: string;
  equation_id: string;
  streak: number;
  wrong_counts: Record<string, number>;
  last_updated_at: string;
}

interface StudentStats {
  student_id: string;
  xp: number;
  mastery_rate: number;
  last_updated_at: string;
}

interface MockDB {
  profiles: Profile[];
  classes: Class[];
  class_members: ClassMember[];
  student_progress: StudentProgress[];
  student_stats: StudentStats[];
}

function getDB(): MockDB {
  const data = localStorage.getItem(DB_KEY);
  if (data) return JSON.parse(data);
  return {
    profiles: [],
    classes: [],
    class_members: [],
    student_progress: [],
    student_stats: [],
  };
}

function saveDB(db: MockDB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  async login(username: string): Promise<Profile> {
    await delay(300);
    const db = getDB();
    const user = db.profiles.find((p) => p.username === username);
    if (!user) throw new Error('用户不存在，请先注册');
    return user;
  },

  async signup(username: string, display_name: string): Promise<Profile> {
    await delay(300);
    const db = getDB();
    if (db.profiles.find((p) => p.username === username)) {
      throw new Error('用户名已存在');
    }
    const newProfile: Profile = {
      id: uuidv4(),
      username,
      display_name,
      avatar_emoji: '👨‍🎓',
    };
    db.profiles.push(newProfile);
    saveDB(db);
    return newProfile;
  },

  async createClass(teacherId: string, name: string): Promise<Class> {
    await delay(300);
    const db = getDB();
    const join_code = Math.floor(100000 + Math.random() * 900000).toString();
    const newClass: Class = {
      id: uuidv4(),
      teacher_id: teacherId,
      join_code,
      name,
      created_at: new Date().toISOString(),
    };
    db.classes.push(newClass);
    saveDB(db);
    return newClass;
  },

  async joinClass(studentId: string, joinCode: string): Promise<Class> {
    await delay(300);
    const db = getDB();
    const targetClass = db.classes.find((c) => c.join_code === joinCode);
    if (!targetClass) throw new Error('班级邀请码无效');
    if (targetClass.teacher_id === studentId) throw new Error('不能加入自己创建的班级');

    const alreadyJoined = db.class_members.find((m) => m.class_id === targetClass.id && m.student_id === studentId);
    if (alreadyJoined) throw new Error('你已经在这个班级里了');

    db.class_members.push({
      class_id: targetClass.id,
      student_id: studentId,
      joined_at: new Date().toISOString(),
    });
    saveDB(db);
    return targetClass;
  },

  async getUserClasses(userId: string) {
    await delay(200);
    const db = getDB();
    const teaching = db.classes.filter((c) => c.teacher_id === userId);
    const memberOfIds = db.class_members.filter((m) => m.student_id === userId).map((m) => m.class_id);
    const learning = db.classes.filter((c) => memberOfIds.includes(c.id));
    return { teaching, learning };
  },

  async syncProgress(studentId: string, progress: { equation_id: string; streak: number; wrong_counts: any }, stats: { xp: number; mastery_rate: number }) {
    const db = getDB();
    const now = new Date().toISOString();

    // Upsert progress
    const pIndex = db.student_progress.findIndex((p) => p.student_id === studentId && p.equation_id === progress.equation_id);
    if (pIndex > -1) {
      db.student_progress[pIndex] = { ...db.student_progress[pIndex], ...progress, last_updated_at: now };
    } else {
      db.student_progress.push({ student_id: studentId, ...progress, last_updated_at: now });
    }

    // Upsert stats
    const sIndex = db.student_stats.findIndex((s) => s.student_id === studentId);
    if (sIndex > -1) {
      db.student_stats[sIndex] = { ...db.student_stats[sIndex], ...stats, last_updated_at: now };
    } else {
      db.student_stats.push({ student_id: studentId, ...stats, last_updated_at: now });
    }

    saveDB(db);
  },

  async getClassDetails(classId: string) {
    await delay(300);
    const db = getDB();
    const classInfo = db.classes.find((c) => c.id === classId);
    if (!classInfo) throw new Error('班级不存在');

    const memberIds = db.class_members.filter((m) => m.class_id === classId).map((m) => m.student_id);
    const students = db.profiles.filter((p) => memberIds.includes(p.id)).map(p => {
      const stats = db.student_stats.find(s => s.student_id === p.id) || { xp: 0, mastery_rate: 0 };
      return { ...p, ...stats };
    });

    const progressRecords = db.student_progress.filter((p) => memberIds.includes(p.student_id));

    return { classInfo, students, progressRecords };
  }
};
