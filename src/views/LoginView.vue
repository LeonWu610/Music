<template>
  <div class="login-page">
    <div class="login-form" v-show="!showRegisterForm">
      <h2>欢迎回来！</h2>
      <form @submit.prevent="login">
        <input type="text" v-model="loginData.username" placeholder="电话号码" required>
        <div class="verification-code">
          <input type="text" v-model="loginData.verificationCode" placeholder="验证码" required>
          <button type="button" @click="sendVerificationCode(loginData.username)">发送验证码</button>
        </div>
        <button type="submit">登陆</button>
      </form>
      <div class="switch-options">
        <span>还没有账号？</span>
        <button @click="toggleForm">注册</button>
      </div>
    </div>
    <div class="register-form" v-show="showRegisterForm">
      <h2>加入!</h2>
      <form @submit.prevent="register">
        <input type="text" v-model="registerData.username" placeholder="Username" required>
        <input type="email" v-model="registerData.email" placeholder="Email" required>
        <input type="password" v-model="registerData.password" placeholder="Password" required>
        <button type="submit">注册</button>
      </form>
      <div class="switch-options">
        <span>有账号了？</span>
        <button @click="toggleForm">登陆</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Login, getCaptcha } from '@/api/api';

const router = useRouter();

const loginData = ref({
  username: '',
  verificationCode: ''
});

const registerData = ref({
  username: '',
  email: '',
  password: ''
});

const showRegisterForm = ref(false);

const toggleForm = () => {
  showRegisterForm.value = !showRegisterForm.value;
};

const sendVerificationCode = (phone) => {
  getCaptcha(phone)
}

const login = () => {
  console.log('Logging in...');
  Login().then((res) => {
    console.log(res);
  })
  router.push('/recommend');
};

const register = () => {
  router.back()
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: rgb(26, 26, 26);
}

.login-form,
.register-form {
  width: 300px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  margin-bottom: 20px;
}

input {
  width: 100%;
  height: 30px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 15px;
}

.verification-code {
  display: flex;
  align-items: center;
  justify-content: center;
  button {
    width: 100px;
    font-size: 12px;
    margin-left: 5px;
    margin-bottom: 7px;
  }
}

button {
  width: 100%;
  padding: 5px;
  background-color: rgb(0, 136, 209);
  color: #fff;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.switch-options {
  text-align: center;
  font-size: 12px;
  margin-top: 10px;
}
</style>
