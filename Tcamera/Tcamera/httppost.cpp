#include "HttpPost.h"
#include <iostream>
#include <QTextCodec>
#include <QFile>

using namespace std;

const int nHTTP_TIME = 10000; //10秒

HttpPost::HttpPost(QObject *parent) :
    QObject(parent)
{
    m_pNetworkManager = new QNetworkAccessManager(this);
    m_pNetworkReply = NULL;
    m_pTimer = new QTimer;
    connect(m_pTimer,SIGNAL(timeout()),this,SLOT(slot_requestTimeout()));//超时信号
}

//发起请求
void HttpPost::sendRequest(const QString &strUrl)
{
    m_strUrl = strUrl;
    QNetworkRequest netRequest;
    netRequest.setHeader(QNetworkRequest::ContentTypeHeader,"application/x-www-form-urlencoded");
    netRequest.setUrl(QUrl(strUrl)); //地址信息
    if(strUrl.toLower().startsWith("https"))//https请求，需ssl支持(下载openssl拷贝libeay32.dll和ssleay32.dll文件至Qt bin目录或程序运行目录)
    {
        QSslConfiguration sslConfig;
        sslConfig.setPeerVerifyMode(QSslSocket::VerifyNone);
        sslConfig.setProtocol(QSsl::TlsV1_1);
        netRequest.setSslConfiguration(sslConfig);
    }
    //QString strBody=QString(""); //http body部分，可封装参数信息
    //QString api_ID=QString("332cc3d4d63e404693589ca02da83600");
    //QString api_secret=QString("72e68c866c34405c8491839da7ffd4d0");
    QByteArray contentByteArray ;//= strBody.toLatin1();//转成二进制
    /*contentByteArray.append("api_id="+api_ID+"&");
    contentByteArray.append("api_secret="+api_secret+"&");
    QString filePath=QString("D:\\face\\face.jpg");

    QFile file(filePath);


    读取所有文件
    QByteArray fileContent = file.readAll();
    边界的时候这里加两杠
    QString boundary = "----weasdashDsdesd";
    起始边界
    QString startBoundary = "--" + boundary;
    结束边界
    QString endBoundary = "\r\n--" + boundary + "--\r\n";
    设置传输类型
    QString qContentType = "multipart/form-data; boundary=" + boundary;
    要发送的内容
    QByteArray content;

    QString tempStr = startBoundary;
    tempStr += "\r\nContent-Disposition: form-data; name=\"media\"; filename=face.jpg\r\n";
    tempStr += "Content-Type:  multipart/form-data; \r\n\r\n";
    content.append(tempStr.toLatin1());
    content.append(fileContent);
    content.append(endBoundary);

    contentByteArray.append("file=");
    contentByteArray.append(content);
*/
    contentByteArray.append("url=http://pic1.ooopic.com/uploadfilepic/sheying/2008-08-26/OOOPIC_vipvip_20080826094224dbb9150eaac77daa130.jpg");
    m_pNetworkReply = m_pNetworkManager->post(netRequest,contentByteArray);//发起post请求

    connect(m_pNetworkReply,SIGNAL(finished()),this,SLOT(slot_requestFinished())); //请求完成信号
    m_pTimer->start(nHTTP_TIME);
}

//请求结束
void HttpPost::slot_requestFinished()
{
    m_pTimer->stop();//关闭定时器
;
    QByteArray resultContent = m_pNetworkReply->readAll();
    QTextCodec* pCodec = QTextCodec::codecForName("UTF-8");
    QString strResult = pCodec->toUnicode(resultContent);
    int nHttpCode = m_pNetworkReply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();//http返回码
    if(nHttpCode == 200)//成功
    {

        emit signal_requestFinished(true,strResult);//请求成功
        cout<<strResult.toStdString()<<endl;
    }
    else
    {
        cout<<"another stupid request"<<endl;
        cout<<strResult.toStdString()<<endl;
        emit signal_requestFinished(false,strResult);//请求失败
    }
    m_pNetworkReply->deleteLater();
    this->deleteLater(); //释放内存
}

//请求超时
void HttpPost::slot_requestTimeout()
{
    emit signal_requestFinished(false,"timeout");//请求失败
    m_pNetworkReply->deleteLater();
    this->deleteLater();//释放内存
}

