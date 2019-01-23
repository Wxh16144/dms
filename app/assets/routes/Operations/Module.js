import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
  Button,
  Card,
  Table,
  message
} from 'antd';

import fetch from '../../utils/fetch';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getParams, formatReviewUrl } from '../../utils/url';
import styles from './Module.less';
import {routerRedux} from "dva/router";

@connect()
export default class Module extends PureComponent {
  state = {
    modalVisible: false,
    data: [],
    loading: false,
    appId: 0,
  };


  componentDidMount() {
    this.fetchModuleList();
  }

  fetchModuleList = async () => {
    this.setState({
      loading: true,
    });
    const params = getParams(this.props.location.search);
    this.setState({
      appId: params.app_id,
    });
    const res = await fetch('get', `/api/moduleList?app_id=${params.app_id}`);
    if (!res) {
      // 请求失败
      return
    }
    this.setState({
      data: res,
      loading: false,
    })
  };

  handleEditDataRoute = (module_id) => {
    const { dispatch } = this.props;
    dispatch(routerRedux.push(`/operations/data${this.props.location.search}&module_id=${module_id}`));
  };

  handleReview = async (module_id) => {
    const params = getParams(this.props.location.search);
    const paramsStr = `/${params.app_id}/${module_id}` + Object.keys(params).sort().map(key => {
      if (key === 'app_id' || key === 'module_id') {
        return '';
      }
      return `/${key}/${params[key]}`
    }).join('');
    const dataRes = await fetch('get', `/api/dataGetTempData?module_id=${module_id}&params=${paramsStr}`);
    const res = await fetch('post', `/api/dataReviewTempData`, {
      data_id: dataRes.id
    });
    if (res) {
      message.success('审核成功');
      return;
    }
    message.error('审核失败');
  }

  // 去审核
  goReview = (associationUrl) => {
    const reviewUrl = formatReviewUrl(associationUrl);
    window.open(reviewUrl, '_blank');
    return;
  };

  render() {
    const { data, loading } = this.state;

    const column = [
      {
        title: '模块名',
        dataIndex: 'name_cn',
        key: 'module_name_cn',
      }, {
        title: '英文名',
        dataIndex: 'name_en',
        key: 'module_name_en',
      }, {
        title: '创建者',
        dataIndex: 'creator',
        key: 'module_creator',
      }, {
        title: '最后更新人',
        dataIndex: 'updater',
        key: 'module_updater',
      }, {
        title: '操作',
        key: 'module_operating',
        render: (text, record) => (
          <span className={styles.tableOperatingButton}>
            <Button type="primary" ghost onClick={() => this.handleEditDataRoute(record.id)}>编辑模块数据</Button>
            {
              !record.association_url ?
                null
                :
                <Button type="primary" ghost onClick={() => this.goReview(record.association_url)}>去审核</Button>
            }
            <Button type="primary" ghost onClick={() => this.handleReview(record.id)}>审核</Button>
          </span>
        ),
      },
    ];

    return (
      <PageHeaderLayout title="Module管理">
        <Row gutter={24}>
          <Col xl={24} lg={24} md={24} sm={24} xs={24}>
            <Card
              title="模块列表"
            >
              <div className={styles.tableList}>
                <Table
                  columns={column}
                  dataSource={data}
                  loading={loading}
                  pagination={false}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </PageHeaderLayout>
    );
  }
}
