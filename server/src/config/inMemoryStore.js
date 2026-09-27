const crypto = require('crypto');

class InMemoryStore {
  constructor() {
    this.collections = {
      users: [],
      workflows: [],
      executions: [],
      executionLogs: [],
      integrations: [],
      notifications: [],
      agentMemories: []
    };
    this.isFallback = true;
  }

  generateId() {
    return crypto.randomBytes(12).toString('hex');
  }

  getCollection(name) {
    if (!this.collections[name]) {
      this.collections[name] = [];
    }
    return this.collections[name];
  }

  find(colName, query = {}, options = {}) {
    let list = [...this.getCollection(colName)];
    list = list.filter(item => this._matches(item, query));

    if (options.sort) {
      const keys = Object.keys(options.sort);
      list.sort((a, b) => {
        for (const key of keys) {
          const dir = options.sort[key];
          const valA = a[key];
          const valB = b[key];
          if (valA < valB) return dir === 1 ? -1 : 1;
          if (valA > valB) return dir === 1 ? 1 : -1;
        }
        return 0;
      });
    }

    if (options.skip) {
      list = list.slice(options.skip);
    }
    if (options.limit) {
      list = list.slice(0, options.limit);
    }

    return list;
  }

  findOne(colName, query = {}) {
    const list = this.getCollection(colName);
    return list.find(item => this._matches(item, query)) || null;
  }

  findById(colName, id) {
    if (!id) return null;
    const strId = id._id ? id._id.toString() : id.toString();
    const list = this.getCollection(colName);
    return list.find(item => item._id === strId || item.id === strId) || null;
  }

  insert(colName, doc) {
    const list = this.getCollection(colName);
    const now = new Date();
    const newDoc = {
      _id: doc._id || this.generateId(),
      createdAt: doc.createdAt || now,
      updatedAt: doc.updatedAt || now,
      ...doc
    };
    list.push(newDoc);
    return newDoc;
  }

  updateById(colName, id, update) {
    const strId = id._id ? id._id.toString() : id.toString();
    const list = this.getCollection(colName);
    const index = list.findIndex(item => item._id === strId || item.id === strId);
    if (index === -1) return null;

    const existing = list[index];
    const updated = {
      ...existing,
      ...update,
      updatedAt: new Date()
    };
    list[index] = updated;
    return updated;
  }

  deleteById(colName, id) {
    const strId = id._id ? id._id.toString() : id.toString();
    const list = this.getCollection(colName);
    const index = list.findIndex(item => item._id === strId || item.id === strId);
    if (index === -1) return false;
    list.splice(index, 1);
    return true;
  }

  count(colName, query = {}) {
    return this.find(colName, query).length;
  }

  _matches(item, query) {
    for (const key of Object.keys(query)) {
      const targetVal = query[key];
      if (targetVal === undefined) continue;

      if (key === '_id' || key === 'id') {
        const strTarget = targetVal._id ? targetVal._id.toString() : targetVal.toString();
        const strItem = item._id ? item._id.toString() : (item.id ? item.id.toString() : '');
        if (strItem !== strTarget) return false;
        continue;
      }

      if (targetVal && typeof targetVal === 'object' && !Array.isArray(targetVal)) {
        if (targetVal.$in && Array.isArray(targetVal.$in)) {
          if (!targetVal.$in.includes(item[key])) return false;
          continue;
        }
        if (targetVal.$ne !== undefined) {
          if (item[key] === targetVal.$ne) return false;
          continue;
        }
      }

      if (item[key] !== targetVal) return false;
    }
    return true;
  }
}

const store = new InMemoryStore();
module.exports = store;
