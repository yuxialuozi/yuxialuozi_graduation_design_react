import { Layout } from 'antd'
import './index.less'

const { Footer: AntFooter } = Layout

const Footer = () => {
  return (
    <AntFooter className="app-footer">
      租户信息管理系统 ©{new Date().getFullYear()} Created for Graduation Design
    </AntFooter>
  )
}

export default Footer
