import React from 'react';
import { Nav, Avatar } from '@douyinfe/semi-ui';
import { IconSemiLogo, IconFeishuLogo, IconHelpCircle, IconBell } from '@douyinfe/semi-icons';
import { IconIntro, IconHeart, IconCalendar, IconCheckbox, IconRadio, IconList, IconToast } from '@douyinfe/semi-icons-lab';
import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.frame}>
      <Nav
        mode="horizontal"
        header={{
          logo: <IconSemiLogo className={styles.semiIconsSemiLogo} />,
          text: "Semi Templates",
        }}
        footer={
          <div className={styles.dIv}>
            <IconFeishuLogo size="large" className={styles.semiIconsFeishuLogo} />
            <IconHelpCircle size="large" className={styles.semiIconsFeishuLogo} />
            <IconBell size="large" className={styles.semiIconsFeishuLogo} />
            <Avatar
              size="small"
              src="https://sf6-cdn-tos.douyinstatic.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/avatarDemo.jpeg"
              color="blue"
              className={styles.avatar}
            >
              示例
            </Avatar>
          </div>
        }
        className={styles.nav}
      >
        <Nav.Item itemKey="Home" text="Home" />
        <Nav.Item itemKey="Project" text="Project" />
        <Nav.Item itemKey="Board" text="Board" />
        <Nav.Item itemKey="Forms" text="Forms" />
      </Nav>
      <div className={styles.main}>
        <Nav
          defaultOpenKeys={["user", "union"]}
          bodyStyle={{ height: 918 }}
          mode="vertical"
          footer={{ collapseButton: true }}
          className={styles.left}
        >
          <Nav.Item
            itemKey="Home"
            text="Home"
            icon={<IconIntro className={styles.iconIntro} />}
            className={styles.navItem}
          />
          <Nav.Item
            itemKey="Dashboard"
            text="Dashboard"
            icon={<IconHeart className={styles.iconIntro} />}
            className={styles.navItem}
          />
          <Nav.Item
            itemKey="Project"
            text="Project"
            icon={<IconCalendar className={styles.iconIntro} />}
            className={styles.navItem}
          />
          <Nav.Item
            itemKey="Tasks"
            text="Tasks"
            icon={<IconCheckbox className={styles.iconIntro} />}
            className={styles.navItem}
          />
          <Nav.Item
            itemKey="Reporting"
            text="Reporting"
            icon={<IconCalendar className={styles.iconIntro} />}
            className={styles.navItem}
          />
          <Nav.Item
            itemKey="Users"
            text="Users"
            icon={<IconRadio className={styles.iconIntro} />}
            className={styles.navItem}
          />
          <Nav.Item
            itemKey="Support"
            text="Support"
            icon={<IconList className={styles.iconIntro} />}
            className={styles.navItem}
          />
          <Nav.Item
            itemKey="Settings"
            text="Settings"
            icon={<IconToast className={styles.iconIntro} />}
            className={styles.navItem}
          />
        </Nav>
        <div className={styles.right}>
          <p className={styles.item}>Reporting</p>
          <div className={styles.frame1321317607}>
            <p className={styles.yourContentHere}>Your Content Here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
