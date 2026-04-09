---
name: 'style-manager'
description: '管理和修改CSS样式，如设置选择器的颜色、字体大小等样式属性。当用户需要修改或管理样式时调用。'
---

# 样式管理器

## 功能

该技能用于管理和修改项目中的CSS样式，包括：

- 设置选择器的样式属性（如颜色、字体大小、边距等）
- 批量修改多个选择器的样式
- 查看和编辑CSS文件

## 使用方法

### 基本语法

```
@style-manager <选择器> <属性>: <值>;
```

### 示例

1. 设置`.title`的颜色为`#000`，字号为`20px`，并添加padding：

   ```
   @style-manager .title color: #000; font-size: 20px; padding: 10px;
   ```

2. 修改多个选择器：

   ```
   @style-manager .btn, .button background-color: #4CAF50; color: white;
   ```

3. 查看CSS文件内容：

   ```
   @style-manager view <文件路径>
   ```

4. 编辑整个CSS文件：
   ```
   @style-manager edit <文件路径>
   <CSS内容>
   ```

## 支持的样式属性

- color
- font-size
- font-weight
- font-family
- background-color
- margin
- padding
- border
- width
- height
- display
- position
- etc.

## 注意事项

- 选择器必须是有效的CSS选择器
- 样式属性和值必须符合CSS语法
- 对于多个样式属性，使用分号分隔
- 对于多个选择器，使用逗号分隔

## 示例场景

### 场景1：修改标题样式

用户输入：

```
@style-manager .title color: #000; font-size: 20px;
```

技能会找到包含`.title`选择器的CSS文件，并修改其样式。

### 场景2：批量修改按钮样式

用户输入：

```
@style-manager .btn, .primary-btn background-color: #4CAF50; color: white; padding: 10px 20px;
```

技能会同时修改`.btn`和`.primary-btn`两个选择器的样式。
