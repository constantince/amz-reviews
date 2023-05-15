import mysql.connector
import pandas as pd
import hashlib

cnx = mysql.connector.connect(
    user='aiamzplus',
    password='dLLbPFHcbHNfpGHR',
    host='localhost',
    database='aiamzplus'
)

def generate_id(email):
    # 将邮箱转换为字节串
    email_bytes = email.encode('utf-8')
  
    # 使用MD5哈希算法对字节串进行哈希处理
    md5_hash = hashlib.md5()
    md5_hash.update(email_bytes)
    id = md5_hash.hexdigest()

    return id


def login(email, password):
    # 定义插入数据的 SQL 语句
    sql = "SELECT * FROM `aiamzplus`.`amz-plus-user` WHERE email = %s AND password = %s"
    val = (email, password)
    
    # 创建游标对象
    mycursor = cnx.cursor()
    
    # 执行操作
    mycursor.execute(sql, val)
    
    try:
        return mycursor.fetchall()
        
    except mysql.connector.Error as err:
        
        return []
        
    
    # 输出插入结果信息
    cursor.close()
    cnx.close()



def createUser(email):

    user = generate_id(email)
    # 定义插入数据的 SQL 语句
    #INSERT INTO `aiamzplus`.`amz-plus-user` (`id`, `user`, `password`, `email`, `type`, `openkey`) VALUES (NULL, 'XXXXX', 'HYX6TEJK9', 'xyz.com', '3', '')
    sql = "INSERT INTO `aiamzplus`.`amz-plus-user` (`user`, `password`, `email`, `type`, `openkey`) VALUES (%s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE user = %s"
    val = (user, "", email, 0, '', user)
    
    # 创建游标对象
    mycursor = cnx.cursor()
    
    mycursor.execute(sql, val)
    # 提交数据库事务
    cnx.commit()
    
    # 输出插入结果信息
    mycursor.close()
    
    return mycursor.rowcount

if __name__ == '__main__':
    createUser("alberteinsteion007@126.com")
