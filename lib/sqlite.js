const q = require('q');
const sqlite3 = require('sqlite3').verbose();

class Sqlite {
  constructor() {
    this.dbPath = '../dhis2.db';
  }


  // create a connection to the sqlite database
  connect() {
    const deferred = q.defer();
    // eslint-disable-next-line consistent-return
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        return deferred.reject(err.message);
      }
      deferred.resolve(true);
    });
    return deferred.promise;
  }

  // update db queries
  exec(sql) {
    const deferred = q.defer();
    // eslint-disable-next-line consistent-return
    this.db.exec(sql, (err) => {
      if (err) {
        return deferred.reject(err.message);
      }
      deferred.resolve(true);
    });
    return deferred.promise;
  }

  // retrieve data from db
  select(sql, params) {
    const deferred = q.defer();
    // eslint-disable-next-line consistent-return
    this.db.all(sql, params, (err, rows) => {
      if (err) {
        return deferred.reject(err.message);
      }
      deferred.resolve(rows);
    });
    return deferred.promise;
  }
}

module.exports = Sqlite;
