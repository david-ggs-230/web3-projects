import{C as e,D as t,V as n,_ as r,l as i,r as a,st as o,x as s,y as c,z as l}from"./ApiController-BypIxMOh.js";import{C as u,b as d,g as f,o as p,p as m,v as h}from"./wui-text-DzotX6h9.js";import{t as g}from"./SIWXUtil-BHJbjPP4.js";import"./wui-button-BXoqq0vj.js";import{t as _}from"./ConstantsUtil-t5plQ6fI.js";import"./wui-link-D35M70E5.js";import{t as v}from"./w3m-email-otp-widget-YUc9flF2.js";import"./wui-icon-box-DuSyCN2R.js";import{n as y,t as b}from"./ref-DznNIK0l.js";import"./wui-email-input-ihX7L0_P.js";var x=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},S=class extends v{constructor(){super(...arguments),this.onOtpSubmit=async r=>{try{if(this.authConnector){let n=a.state.activeChain,o=i.getConnections(n),u=l.state.remoteFeatures?.multiWallet,d=o.length>0;if(await this.authConnector.provider.connectOtp({otp:r}),s.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_PASS`}),n)await i.connectExternal(this.authConnector,n);else throw Error(`Active chain is not set on ChainController`);if(l.state.remoteFeatures?.emailCapture)return;if(l.state.siwx){await g.isAuthenticated()&&c.close();return}if(d&&u){e.replace(`ProfileWallets`),t.showSuccess(`New Wallet Added`);return}c.close()}}catch(e){throw s.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_FAIL`,properties:{message:n.parseError(e)}}),e}},this.onOtpResend=async e=>{this.authConnector&&(await this.authConnector.provider.connectEmail({email:e}),s.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_SENT`}))}}};S=x([p(`w3m-email-verify-otp-view`)],S);var C=m`
  wui-icon-box {
    height: ${({spacing:e})=>e[16]};
    width: ${({spacing:e})=>e[16]};
  }
`,w=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},T=class extends h{constructor(){super(),this.email=e.state.data?.email,this.authConnector=r.getAuthConnector(),this.loading=!1,this.listenForDeviceApproval()}render(){if(!this.email)throw Error(`w3m-email-verify-device-view: No email provided`);if(!this.authConnector)throw Error(`w3m-email-verify-device-view: No auth connector provided`);return d`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${[`6`,`3`,`6`,`3`]}
        gap="4"
      >
        <wui-icon-box size="xl" color="accent-primary" icon="sealCheck"></wui-icon-box>

        <wui-flex flexDirection="column" alignItems="center" gap="3">
          <wui-flex flexDirection="column" alignItems="center">
            <wui-text variant="md-regular" color="primary">
              Approve the login link we sent to
            </wui-text>
            <wui-text variant="md-regular" color="primary"><b>${this.email}</b></wui-text>
          </wui-flex>

          <wui-text variant="sm-regular" color="secondary" align="center">
            The code expires in 20 minutes
          </wui-text>

          <wui-flex alignItems="center" id="w3m-resend-section" gap="2">
            <wui-text variant="sm-regular" color="primary" align="center">
              Didn't receive it?
            </wui-text>
            <wui-link @click=${this.onResendCode.bind(this)} .disabled=${this.loading}>
              Resend email
            </wui-link>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}async listenForDeviceApproval(){if(this.authConnector)try{await this.authConnector.provider.connectDevice(),s.sendEvent({type:`track`,event:`DEVICE_REGISTERED_FOR_EMAIL`}),s.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_SENT`}),e.replace(`EmailVerifyOtp`,{email:this.email})}catch{e.goBack()}}async onResendCode(){try{if(!this.loading){if(!this.authConnector||!this.email)throw Error(`w3m-email-login-widget: Unable to resend email`);this.loading=!0,await this.authConnector.provider.connectEmail({email:this.email}),this.listenForDeviceApproval(),t.showSuccess(`Code email resent`)}}catch(e){t.showError(e)}finally{this.loading=!1}}};T.styles=C,w([f()],T.prototype,`loading`,void 0),T=w([p(`w3m-email-verify-device-view`)],T);var E=u`
  wui-email-input {
    width: 100%;
  }

  form {
    width: 100%;
    display: block;
    position: relative;
  }
`,D=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},O=class extends h{constructor(){super(...arguments),this.formRef=b(),this.initialEmail=e.state.data?.email??``,this.redirectView=e.state.data?.redirectView,this.email=``,this.loading=!1}firstUpdated(){this.formRef.value?.addEventListener(`keydown`,e=>{e.key===`Enter`&&this.onSubmitEmail(e)})}render(){return d`
      <wui-flex flexDirection="column" padding="4" gap="4">
        <form ${y(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
          <wui-email-input
            value=${this.initialEmail}
            .disabled=${this.loading}
            @inputChange=${this.onEmailInputChange.bind(this)}
          >
          </wui-email-input>
          <input type="submit" hidden />
        </form>
        ${this.buttonsTemplate()}
      </wui-flex>
    `}onEmailInputChange(e){this.email=e.detail}async onSubmitEmail(n){try{if(this.loading)return;this.loading=!0,n.preventDefault();let t=r.getAuthConnector();if(!t)throw Error(`w3m-update-email-wallet: Auth connector not found`);let i=await t.provider.updateEmail({email:this.email});s.sendEvent({type:`track`,event:`EMAIL_EDIT`}),i.action===`VERIFY_SECONDARY_OTP`?e.push(`UpdateEmailSecondaryOtp`,{email:this.initialEmail,newEmail:this.email,redirectView:this.redirectView}):e.push(`UpdateEmailPrimaryOtp`,{email:this.initialEmail,newEmail:this.email,redirectView:this.redirectView})}catch(e){t.showError(e),this.loading=!1}}buttonsTemplate(){let t=!this.loading&&this.email.length>3&&this.email!==this.initialEmail;return this.redirectView?d`
      <wui-flex gap="3">
        <wui-button size="md" variant="neutral" fullWidth @click=${e.goBack}>
          Cancel
        </wui-button>

        <wui-button
          size="md"
          variant="accent-primary"
          fullWidth
          @click=${this.onSubmitEmail.bind(this)}
          .disabled=${!t}
          .loading=${this.loading}
        >
          Save
        </wui-button>
      </wui-flex>
    `:d`
        <wui-button
          size="md"
          variant="accent-primary"
          fullWidth
          @click=${this.onSubmitEmail.bind(this)}
          .disabled=${!t}
          .loading=${this.loading}
        >
          Save
        </wui-button>
      `}};O.styles=E,D([f()],O.prototype,`email`,void 0),D([f()],O.prototype,`loading`,void 0),O=D([p(`w3m-update-email-wallet-view`)],O);var k=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},A=class extends v{constructor(){super(),this.email=e.state.data?.email,this.onOtpSubmit=async t=>{try{this.authConnector&&(await this.authConnector.provider.updateEmailPrimaryOtp({otp:t}),s.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_PASS`}),e.replace(`UpdateEmailSecondaryOtp`,e.state.data))}catch(e){throw s.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_FAIL`,properties:{message:n.parseError(e)}}),e}},this.onStartOver=()=>{e.replace(`UpdateEmailWallet`,e.state.data)}}};A=k([p(`w3m-update-email-primary-otp-view`)],A);var j=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},M=class extends v{constructor(){super(),this.email=e.state.data?.newEmail,this.redirectView=e.state.data?.redirectView,this.onOtpSubmit=async t=>{try{this.authConnector&&(await this.authConnector.provider.updateEmailSecondaryOtp({otp:t}),s.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_PASS`}),this.redirectView&&e.reset(this.redirectView))}catch(e){throw s.sendEvent({type:`track`,event:`EMAIL_VERIFICATION_CODE_FAIL`,properties:{message:n.parseError(e)}}),e}},this.onStartOver=()=>{e.replace(`UpdateEmailWallet`,e.state.data)}}};M=j([p(`w3m-update-email-secondary-otp-view`)],M);var N=function(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a},P=class extends h{constructor(){super(),this.authConnector=r.getAuthConnector(),this.isEmailEnabled=l.state.remoteFeatures?.email,this.isAuthEnabled=this.checkIfAuthEnabled(r.state.connectors),this.connectors=r.state.connectors,r.subscribeKey(`connectors`,e=>{this.connectors=e,this.isAuthEnabled=this.checkIfAuthEnabled(this.connectors)})}render(){if(!this.isEmailEnabled)throw Error(`w3m-email-login-view: Email is not enabled`);if(!this.isAuthEnabled)throw Error(`w3m-email-login-view: No auth connector provided`);return d`<wui-flex flexDirection="column" .padding=${[`1`,`3`,`3`,`3`]} gap="4">
      <w3m-email-login-widget></w3m-email-login-widget>
    </wui-flex> `}checkIfAuthEnabled(e){let t=e.filter(e=>e.type===_.CONNECTOR_TYPE_AUTH).map(e=>e.chain);return o.AUTH_CONNECTOR_SUPPORTED_CHAINS.some(e=>t.includes(e))}};N([f()],P.prototype,`connectors`,void 0),P=N([p(`w3m-email-login-view`)],P);export{P as W3mEmailLoginView,v as W3mEmailOtpWidget,T as W3mEmailVerifyDeviceView,S as W3mEmailVerifyOtpView,A as W3mUpdateEmailPrimaryOtpView,M as W3mUpdateEmailSecondaryOtpView,O as W3mUpdateEmailWalletView};