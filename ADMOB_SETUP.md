# 📱 AdMob Setup - Birthday Reminder

## ✅ Tvoje AdMob údaje:

### **iOS App ID**: 
```
ca-app-pub-7020548231542184~9146045046
```

### **Banner Ad Unit ID**:
```
ca-app-pub-7020548231542184/5813119287
```

---

## 📋 Co je nastaveno:

### 1. **app.json** ✅
- iOS App ID: `ca-app-pub-7020548231542184~9146045046`
- Plugin: `react-native-google-mobile-ads`

### 2. **AdBanner.tsx** ✅
- Banner Ad Unit ID: `ca-app-pub-7020548231542184/5813119287`
- Test režim v development módu
- Production režim s tvým ID

### 3. **services/ads.ts** ✅
- Inicializace AdMob
- Interstitial reklamy (placeholder - potřebuješ vytvořit)

---

## 🚀 Další kroky:

### **Krok 1: Vytvoř Interstitial reklamní jednotku (volitelné)**

1. Jdi na [AdMob Console](https://apps.admob.com)
2. Vyber svou aplikaci **Birthday Reminder**
3. Klikni **Add Ad Unit** → **Interstitial**
4. Zkopíruj Ad Unit ID
5. Updatuj v `services/ads.ts` řádek 78:
   ```typescript
   const adUnitId = __DEV__ 
     ? TestIdsEnum?.INTERSTITIAL 
     : 'TVOJE_INTERSTITIAL_AD_UNIT_ID'; // Sem dej nové ID
   ```

### **Krok 2: Test režim**

V **development módu** (`__DEV__`) se používají **testovací reklamy**.
V **production buildu** se používají **tvoje skutečné reklamy**.

#### Testování:
```bash
# Development (test ads)
npx expo start

# Production build (real ads)
eas build --platform ios --profile production
```

### **Krok 3: Ověř implementaci**

Po buildu pro TestFlight:

1. **Neplatící uživatelé** uvidí bannery
2. **Premium uživatelé** neuvidí reklamy
3. Reklamy se zobrazí na hlavní stránce (dole)

---

## 📝 Poznámky:

### **Banner umístění:**
- Hlavní stránka (index.tsx) - dole
- Pouze pro neplatící uživatele
- Premium uživatelé vidí "Unlock Premium" kartu místo reklam

### **Compliance:**
- ✅ `requestNonPersonalizedAdsOnly: true` - GDPR compliant
- ✅ Reklamy se zobrazují jen pro neplatící
- ✅ Možnost upgradovat na Premium (bez reklam)

### **AdMob Review:**
- AdMob kontroluje implementaci
- Může trvat 24-48 hodin
- První reklamy se zobrazí až po schválení

---

## 🔧 Troubleshooting:

### **Problém: Reklamy se nezobrazují**
1. Zkontroluj, že nejsi Premium uživatel
2. Zkontroluj, že app je v production módu (ne dev)
3. Počkaj 24-48 hodin na AdMob review
4. Zkontroluj AdMob konzoli pro chyby

### **Problém: "Native module not linked"**
```bash
# Vyčisti build
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Rebuild
npx expo prebuild --clean
npx expo run:ios
```

### **Problém: Test reklamy se zobrazují v produkci**
- Zkontroluj, že build je production: `eas build --profile production`
- Ne development: `npx expo run:ios`

---

## ✅ Checklist před odesláním na TestFlight:

- [x] iOS App ID nastaven v app.json
- [x] Banner Ad Unit ID nastaven v AdBanner.tsx
- [x] Test režim funguje v development
- [x] Production režim používá tvoje ID
- [ ] (Volitelné) Interstitial Ad Unit vytvořen a nastaven
- [ ] Reklamy testovány na reálném zařízení
- [ ] Premium uživatelé nevidí reklamy
- [ ] AdMob zásady přečteny a implementovány

---

## 📞 AdMob zásady:

Ujisti se, že tvoje implementace splňuje:
- ✅ Žádné více než 1-2 reklamy na obrazovce
- ✅ Reklamy nejsou překrývající obsah
- ✅ Uživatelé mohou odstranit reklamy (Premium)
- ✅ GDPR compliance (non-personalized ads)

Více na: https://support.google.com/admob/answer/6128543

---

Hotovo! 🎉 Tvoje AdMob je nastaveno a připraveno na TestFlight!
