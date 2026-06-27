# Day 9: 地理数据分析

## 学习目标

完成今天的学习后，你将能够：
- 理解地理数据类型
- 进行地图可视化
- 进行空间分析
- 掌握地理编码

## 技术原理

### 地理数据类型

#### 矢量数据
1. **点（Point）**：坐标位置
2. **线（Line）**：路径、道路
3. **面（Polygon）**：区域、边界

#### 栅格数据
1. **图像**：卫星图像、航拍图像
2. **网格**：规则网格数据

### 坐标系统

#### 地理坐标系
1. **经度**：东西位置
2. **纬度**：南北位置
3. **WGS84**：全球通用坐标系

#### 投影坐标系
1. **UTM**：通用横轴墨卡托投影
2. **高斯-克吕格**：中国常用投影

### 空间分析

#### 基本操作
1. **距离计算**：两点之间的距离
2. **缓冲区分析**：创建缓冲区
3. **叠加分析**：图层叠加
4. **空间查询**：基于位置的查询

#### 高级分析
1. **空间聚类**：DBSCAN、K-means
2. **空间插值**：克里金插值、反距离加权
3. **网络分析**：路径规划、服务区分析

### 地理编码

#### 正向地理编码
将地址转换为坐标

#### 反向地理编码
将坐标转换为地址

## 案例：城市设施分析

假设我们有一个城市设施数据集，需要：
1. 可视化设施分布
2. 分析设施覆盖范围
3. 计算设施之间的距离
4. 进行空间聚类

## 应用场景

1. **城市规划**：设施布局、交通规划
2. **商业分析**：选址分析、市场覆盖
3. **环境监测**：污染分布、生态分析
4. **物流配送**：路径优化、配送范围
5. **应急管理**：灾害评估、救援规划

## 代码案例

### 地理数据处理

```python
# 地理数据处理示例

import pandas as pd
import numpy as np
import geopandas as gpd
import matplotlib.pyplot as plt
from shapely.geometry import Point, LineString, Polygon

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建点数据
# 创建一些城市坐标
cities = {
    '城市': ['北京', '上海', '广州', '深圳', '成都', '杭州', '武汉', '南京'],
    '经度': [116.4074, 121.4737, 113.2644, 114.0579, 104.0665, 120.1551, 114.3055, 118.7969],
    '纬度': [39.9042, 31.2304, 23.1291, 22.5431, 30.5728, 30.2741, 30.5928, 32.0603],
    '人口(万)': [2154, 2487, 1868, 1756, 2094, 1220, 1233, 931]
}

df = pd.DataFrame(cities)

# 创建几何对象
geometry = [Point(xy) for xy in zip(df['经度'], df['纬度'])]

# 创建GeoDataFrame
gdf = gpd.GeoDataFrame(df, geometry=geometry)

print("点数据:")
print(gdf)

# 2. 创建线数据
# 创建城市之间的连线
lines = []
line_data = []

for i in range(len(gdf)):
    for j in range(i + 1, len(gdf)):
        line = LineString([gdf.geometry.iloc[i], gdf.geometry.iloc[j]])
        lines.append(line)
        line_data.append({
            '起点': gdf['城市'].iloc[i],
            '终点': gdf['城市'].iloc[j]
        })

line_df = pd.DataFrame(line_data)
line_gdf = gpd.GeoDataFrame(line_df, geometry=lines)

print("\n线数据:")
print(line_gdf.head())

# 3. 创建面数据
# 创建一个简单的区域
polygon = Polygon([(110, 20), (125, 20), (125, 42), (110, 42)])
area_gdf = gpd.GeoDataFrame([{'名称': '研究区域'}], geometry=[polygon])

print("\n面数据:")
print(area_gdf)

# 4. 可视化
fig, ax = plt.subplots(1, 1, figsize=(12, 8))

# 绘制区域
area_gdf.plot(ax=ax, alpha=0.3, color='lightblue')

# 绘制连线
line_gdf.plot(ax=ax, color='gray', linewidth=0.5, alpha=0.5)

# 绘制城市点
gdf.plot(ax=ax, color='red', markersize=gdf['人口(万)'] / 10, alpha=0.7)

# 添加城市标签
for idx, row in gdf.iterrows():
    ax.annotate(row['城市'], (row.geometry.x, row.geometry.y),
                xytext=(5, 5), textcoords='offset points',
                fontsize=9, fontweight='bold')

ax.set_title('中国主要城市分布', fontsize=16, fontweight='bold')
ax.set_xlabel('经度')
ax.set_ylabel('纬度')
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 5. 基本空间操作
print("\n空间操作:")
print("=" * 50)

# 计算两点之间的距离（单位：度）
point1 = gdf.geometry.iloc[0]  # 北京
point2 = gdf.geometry.iloc[1]  # 上海
distance = point1.distance(point2)
print(f"北京到上海的距离（度）: {distance:.4f}")

# 计算所有城市到北京的距离
beijing = gdf.geometry.iloc[0]
gdf['到北京距离'] = gdf.geometry.apply(lambda x: x.distance(beijing))
print("\n各城市到北京的距离:")
print(gdf[['城市', '到北京距离']])

# 6. 缓冲区分析
# 创建缓冲区
gdf['缓冲区'] = gdf.geometry.buffer(2)  # 2度的缓冲区

# 可视化缓冲区
fig, ax = plt.subplots(1, 1, figsize=(12, 8))

# 绘制缓冲区
gdf['缓冲区'].plot(ax=ax, alpha=0.3, color='skyblue')

# 绘制城市点
gdf.plot(ax=ax, color='red', markersize=100)

ax.set_title('城市缓冲区分析', fontsize=16, fontweight='bold')
ax.set_xlabel('经度')
ax.set_ylabel('纬度')
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

### 地图可视化

```python
# 地图可视化示例

import pandas as pd
import numpy as np
import geopandas as gpd
import matplotlib.pyplot as plt
import folium
from folium import plugins

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建示例数据
np.random.seed(42)
n_points = 100

# 生成随机点（模拟北京市内的设施）
lons = np.random.uniform(116.0, 116.8, n_points)
lats = np.random.uniform(39.7, 40.2, n_points)
values = np.random.uniform(0, 100, n_points)
categories = np.random.choice(['商业', '教育', '医疗', '交通'], n_points)

df = pd.DataFrame({
    '经度': lons,
    '纬度': lats,
    '值': values,
    '类别': categories
})

geometry = [Point(xy) for xy in zip(df['经度'], df['纬度'])]
gdf = gpd.GeoDataFrame(df, geometry=geometry)

print("设施数据:")
print(gdf.head())

# 2. 使用matplotlib绘制地图
fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# 按类别着色
colors = {'商业': 'red', '教育': 'blue', '医疗': 'green', '交通': 'orange'}
for category, color in colors.items():
    mask = gdf['类别'] == category
    gdf[mask].plot(ax=axes[0], color=color, markersize=50, alpha=0.6, label=category)

axes[0].set_title('按类别分布', fontsize=14, fontweight='bold')
axes[0].set_xlabel('经度')
axes[0].set_ylabel('纬度')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# 按值着色
gdf.plot(ax=axes[1], column='值', cmap='YlOrRd', markersize=50, alpha=0.6, legend=True)
axes[1].set_title('按值分布', fontsize=14, fontweight='bold')
axes[1].set_xlabel('经度')
axes[1].set_ylabel('纬度')
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 3. 使用folium创建交互式地图
# 创建基础地图
m = folium.Map(location=[39.9, 116.4], zoom_start=10, tiles='OpenStreetMap')

# 添加标记
for idx, row in gdf.iterrows():
    folium.CircleMarker(
        location=[row['纬度'], row['经度']],
        radius=5,
        color=colors.get(row['类别'], 'gray'),
        fill=True,
        fill_color=colors.get(row['类别'], 'gray'),
        fill_opacity=0.7,
        popup=f"类别: {row['类别']}<br>值: {row['值']:.2f}"
    ).add_to(m)

# 添加热力图
heat_data = [[row['纬度'], row['经度']] for idx, row in gdf.iterrows()]
plugins.HeatMap(heat_data).add_to(m)

# 保存地图
m.save('beijing_facilities.html')
print("\n交互式地图已保存为 beijing_facilities.html")

# 4. 创建等值线图
# 创建网格数据
x = np.linspace(116.0, 116.8, 50)
y = np.linspace(39.7, 40.2, 50)
X, Y = np.meshgrid(x, y)

# 模拟某种密度值
Z = np.sin(X * 10) * np.cos(Y * 10) + np.random.normal(0, 0.1, X.shape)

fig, ax = plt.subplots(1, 1, figsize=(10, 8))
contour = ax.contourf(X, Y, Z, levels=20, cmap='viridis', alpha=0.7)
plt.colorbar(contour, ax=ax, label='密度值')
ax.set_title('等值线图', fontsize=16, fontweight='bold')
ax.set_xlabel('经度')
ax.set_ylabel('纬度')
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 5. 创建 choropleth 地图
# 创建区域数据
regions = {
    '区域': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区'],
    '经度': [116.418, 116.366, 116.486, 116.311, 116.287, 116.224],
    '纬度': [39.917, 39.912, 39.921, 39.957, 39.863, 39.906],
    '人口(万)': [82, 110, 345, 328, 212, 62],
    'GDP(亿)': [2000, 3000, 5000, 6000, 1500, 500]
}

region_df = pd.DataFrame(regions)
region_geometry = [Point(xy) for xy in zip(region_df['经度'], region_df['纬度'])]
region_gdf = gpd.GeoDataFrame(region_df, geometry=region_geometry)

# 可视化
fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# 人口分布
region_gdf.plot(ax=axes[0], column='人口(万)', cmap='YlOrRd', markersize=region_gdf['人口(万)'] * 2, legend=True)
axes[0].set_title('人口分布', fontsize=14, fontweight='bold')
axes[0].set_xlabel('经度')
axes[0].set_ylabel('纬度')

# GDP分布
region_gdf.plot(ax=axes[1], column='GDP(亿)', cmap='YlGnBu', markersize=region_gdf['GDP(亿)'] / 10, legend=True)
axes[1].set_title('GDP分布', fontsize=14, fontweight='bold')
axes[1].set_xlabel('经度')
axes[1].set_ylabel('纬度')

plt.tight_layout()
plt.show()
```

### 空间分析

```python
# 空间分析示例

import pandas as pd
import numpy as np
import geopandas as gpd
import matplotlib.pyplot as plt
from shapely.geometry import Point, Polygon
from scipy.spatial.distance import cdist
from sklearn.cluster import DBSCAN

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 创建示例数据
np.random.seed(42)
n_points = 200

# 生成三个聚类中心
centers = [(116.4, 39.9), (116.6, 40.0), (116.5, 39.8)]
points = []
for center in centers:
    cluster_points = np.random.normal(center, 0.05, (n_points // 3, 2))
    points.extend(cluster_points)

points = np.array(points)
df = pd.DataFrame({'经度': points[:, 0], '纬度': points[:, 1]})
geometry = [Point(xy) for xy in zip(df['经度'], df['纬度'])]
gdf = gpd.GeoDataFrame(df, geometry=geometry)

print("原始数据:")
print(gdf.head())

# 2. DBSCAN空间聚类
# 将经纬度转换为弧度（用于DBSCAN）
coords_rad = np.radians(gdf[['纬度', '经度']].values)

# 使用DBSCAN进行聚类
# eps是邻域半径（单位：弧度），min_samples是最小样本数
db = DBSCAN(eps=0.01, min_samples=5).fit(coords_rad)
gdf['聚类标签'] = db.labels_

print("\n聚类结果:")
print(gdf['聚类标签'].value_counts())

# 可视化聚类结果
fig, ax = plt.subplots(1, 1, figsize=(10, 8))

# 绘制不同聚类的点
unique_labels = set(gdf['聚类标签'])
colors = plt.cm.Set1(np.linspace(0, 1, len(unique_labels)))

for label, color in zip(unique_labels, colors):
    if label == -1:
        # 噪声点
        color = 'gray'
        marker = 'x'
    else:
        marker = 'o'
    
    mask = gdf['聚类标签'] == label
    gdf[mask].plot(ax=ax, color=color, markersize=50, alpha=0.6, 
                   label=f'聚类 {label}' if label != -1 else '噪声', marker=marker)

ax.set_title('DBSCAN空间聚类', fontsize=16, fontweight='bold')
ax.set_xlabel('经度')
ax.set_ylabel('纬度')
ax.legend()
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 3. 距离矩阵计算
# 计算所有点之间的距离矩阵
coords = gdf[['经度', '纬度']].values
distance_matrix = cdist(coords, coords, metric='euclidean')

print("\n距离矩阵形状:", distance_matrix.shape)
print("平均距离:", np.mean(distance_matrix))
print("最大距离:", np.max(distance_matrix))
print("最小距离:", np.min(distance_matrix))

# 可视化距离矩阵
plt.figure(figsize=(10, 8))
plt.imshow(distance_matrix, cmap='hot', interpolation='nearest')
plt.colorbar(label='距离')
plt.title('距离矩阵', fontsize=16, fontweight='bold')
plt.xlabel('点索引')
plt.ylabel('点索引')
plt.show()

# 4. 缓冲区分析
# 创建缓冲区
gdf['缓冲区'] = gdf.geometry.buffer(0.02)  # 0.02度的缓冲区

# 计算缓冲区重叠
from shapely.ops import unary_union

# 合并所有缓冲区
union_buffer = unary_union(gdf['缓冲区'].tolist())
print(f"\n合并后的缓冲区面积: {union_buffer.area:.6f} 平方度")

# 可视化缓冲区
fig, ax = plt.subplots(1, 1, figsize=(10, 8))

# 绘制合并后的缓冲区
gpd.GeoSeries([union_buffer]).plot(ax=ax, alpha=0.3, color='skyblue')

# 绘制原始点
gdf.plot(ax=ax, color='red', markersize=50, alpha=0.7)

ax.set_title('缓冲区分析', fontsize=16, fontweight='bold')
ax.set_xlabel('经度')
ax.set_ylabel('纬度')
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 5. 最近邻分析
from scipy.spatial import KDTree

# 创建KD树
tree = KDTree(coords)

# 查询每个点的最近邻
distances, indices = tree.query(coords, k=2)  # k=2包括自身
nearest_distances = distances[:, 1]  # 排除自身

print(f"\n最近邻距离统计:")
print(f"平均最近邻距离: {np.mean(nearest_distances):.6f}")
print(f"最大最近邻距离: {np.max(nearest_distances):.6f}")
print(f"最小最近邻距离: {np.min(nearest_distances):.6f}")

# 可视化最近邻距离
plt.figure(figsize=(10, 6))
plt.hist(nearest_distances, bins=30, edgecolor='black', alpha=0.7, color='skyblue')
plt.title('最近邻距离分布', fontsize=16, fontweight='bold')
plt.xlabel('距离')
plt.ylabel('频数')
plt.grid(True, alpha=0.3)
plt.show()

# 6. 空间插值（反距离加权法）
def idw_interpolation(x, y, values, xi, yi, power=2):
    """反距离加权插值"""
    distances = np.sqrt((x - xi)**2 + (y - yi)**2)
    
    # 避免除零错误
    distances = np.where(distances == 0, 1e-10, distances)
    
    weights = 1 / distances**power
    interpolated_value = np.sum(weights * values) / np.sum(weights)
    
    return interpolated_value

# 创建插值网格
x_min, x_max = gdf['经度'].min() - 0.05, gdf['经度'].max() + 0.05
y_min, y_max = gdf['纬度'].min() - 0.05, gdf['纬度'].max() + 0.05

xi = np.linspace(x_min, x_max, 50)
yi = np.linspace(y_min, y_max, 50)
XI, YI = np.meshgrid(xi, yi)

# 为每个点分配随机值
gdf['随机值'] = np.random.uniform(0, 100, len(gdf))

# 进行插值
ZI = np.zeros_like(XI)
for i in range(len(xi)):
    for j in range(len(yi)):
        ZI[j, i] = idw_interpolation(
            gdf['经度'].values, 
            gdf['纬度'].values, 
            gdf['随机值'].values,
            xi[i], 
            yi[j]
        )

# 可视化插值结果
plt.figure(figsize=(10, 8))
plt.contourf(XI, YI, ZI, levels=20, cmap='viridis', alpha=0.7)
plt.colorbar(label='插值值')
plt.scatter(gdf['经度'], gdf['纬度'], c='red', s=50, edgecolors='black', label='观测点')
plt.title('反距离加权插值', fontsize=16, fontweight='bold')
plt.xlabel('经度')
plt.ylabel('纬度')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

### 地理编码

```python
# 地理编码示例

import pandas as pd
import numpy as np
import geopandas as gpd
import matplotlib.pyplot as plt
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import time

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 1. 地理编码函数
def geocode_address(address):
    """将地址转换为坐标"""
    geolocator = Nominatim(user_agent="my_geocoder")
    try:
        location = geolocator.geocode(address)
        if location:
            return location.latitude, location.longitude
        else:
            return None, None
    except Exception as e:
        print(f"地理编码错误: {e}")
        return None, None

# 2. 反向地理编码函数
def reverse_geocode(lat, lon):
    """将坐标转换为地址"""
    geolocator = Nominatim(user_agent="my_geocoder")
    try:
        location = geolocator.reverse((lat, lon))
        if location:
            return location.address
        else:
            return None
    except Exception as e:
        print(f"反向地理编码错误: {e}")
        return None

# 3. 测试地理编码
print("地理编码测试:")
print("=" * 50)

# 注意：由于网络限制，这里使用模拟数据
# 实际使用时需要网络连接

# 模拟地理编码结果
addresses = [
    "北京市天安门广场",
    "上海市东方明珠",
    "广州市广州塔",
    "深圳市市民中心",
    "成都市天府广场"
]

# 模拟坐标
coords = [
    (39.9042, 116.4074),  # 天安门
    (31.2397, 121.4998),  # 东方明珠
    (23.1066, 113.3245),  # 广州塔
    (22.5431, 114.0579),  # 市民中心
    (30.5728, 104.0665)   # 天府广场
]

# 创建DataFrame
df = pd.DataFrame({
    '地址': addresses,
    '纬度': [c[0] for c in coords],
    '经度': [c[1] for c in coords]
})

print("地理编码结果:")
print(df)

# 4. 计算距离矩阵
print("\n距离矩阵（单位：公里）:")
print("=" * 50)

# 计算所有点之间的距离
n = len(df)
distance_matrix = np.zeros((n, n))

for i in range(n):
    for j in range(n):
        if i != j:
            point1 = (df['纬度'].iloc[i], df['经度'].iloc[i])
            point2 = (df['纬度'].iloc[j], df['经度'].iloc[j])
            distance_matrix[i, j] = geodesic(point1, point2).kilometers

# 创建距离DataFrame
distance_df = pd.DataFrame(distance_matrix, index=df['地址'], columns=df['地址'])
print(distance_df.round(2))

# 5. 可视化距离矩阵
plt.figure(figsize=(10, 8))
plt.imshow(distance_matrix, cmap='YlOrRd', interpolation='nearest')
plt.colorbar(label='距离 (公里)')
plt.xticks(range(n), df['地址'], rotation=45, ha='right')
plt.yticks(range(n), df['地址'])
plt.title('城市间距离矩阵', fontsize=16, fontweight='bold')

# 在矩阵中显示数值
for i in range(n):
    for j in range(n):
        plt.text(j, i, f'{distance_matrix[i, j]:.0f}', 
                ha='center', va='center', fontsize=8)

plt.tight_layout()
plt.show()

# 6. 创建GeoDataFrame
geometry = [Point(xy) for xy in zip(df['经度'], df['纬度'])]
gdf = gpd.GeoDataFrame(df, geometry=geometry)

# 7. 可视化地图
fig, ax = plt.subplots(1, 1, figsize=(12, 8))

# 绘制点
gdf.plot(ax=ax, color='red', markersize=100, alpha=0.7)

# 添加标签
for idx, row in gdf.iterrows():
    ax.annotate(row['地址'], (row.geometry.x, row.geometry.y),
                xytext=(5, 5), textcoords='offset points',
                fontsize=9, fontweight='bold')

# 添加连线
for i in range(len(gdf)):
    for j in range(i + 1, len(gdf)):
        ax.plot([gdf.geometry.iloc[i].x, gdf.geometry.iloc[j].x],
                [gdf.geometry.iloc[i].y, gdf.geometry.iloc[j].y],
                'k-', alpha=0.3, linewidth=0.5)

ax.set_title('中国主要城市分布', fontsize=16, fontweight='bold')
ax.set_xlabel('经度')
ax.set_ylabel('纬度')
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 8. 最近设施查询
def find_nearest_facility(point, facilities):
    """查找最近的设施"""
    min_distance = float('inf')
    nearest_facility = None
    
    for idx, facility in facilities.iterrows():
        facility_point = (facility['纬度'], facility['经度'])
        distance = geodesic(point, facility_point).kilometers
        
        if distance < min_distance:
            min_distance = distance
            nearest_facility = facility['地址']
    
    return nearest_facility, min_distance

# 查询离某个点最近的设施
test_point = (39.9, 116.4)  # 测试点
nearest, distance = find_nearest_facility(test_point, df)
print(f"\n离{test_point}最近的设施是: {nearest}")
print(f"距离: {distance:.2f} 公里")
```

## 课后练习

### 练习1：地理数据处理
1. 创建点、线、面数据
2. 进行基本空间操作
3. 计算距离和面积
4. 进行缓冲区分析

### 练习2：地图可视化
1. 使用matplotlib绘制地图
2. 使用folium创建交互式地图
3. 创建等值线图
4. 创建choropleth地图

### 练习3：空间分析
1. 进行DBSCAN空间聚类
2. 计算距离矩阵
3. 进行最近邻分析
4. 进行空间插值

### 练习4：地理编码
1. 进行地理编码
2. 进行反向地理编码
3. 计算城市间距离
4. 查找最近设施

## 常见问题

### Q1: 如何选择坐标系？
A: 根据应用选择：
- 全球数据：WGS84
- 中国数据：CGCS2000
- 区域分析：UTM投影

### Q2: 地理编码不准确怎么办？
A: 可以尝试：
1. 使用更详细的地址
2. 使用不同的地理编码服务
3. 手动修正坐标

### Q3: 如何处理大量地理数据？
A: 可以使用：
1. 空间索引
2. 分块处理
3. 并行计算

### Q4: 空间分析需要什么库？
A: 常用库包括：
1. geopandas：地理数据处理
2. shapely：几何操作
3. folium：交互式地图
4. scipy：空间统计

### Q5: 如何提高地图可视化效果？
A: 可以尝试：
1. 使用合适的颜色映射
2. 添加图例和标签
3. 调整透明度
4. 使用交互式地图

## 下一步学习

完成今天的学习后，建议你：
1. 练习处理真实的地理数据
2. 掌握空间分析技术
3. 学习地理编码方法
4. 准备进入Day 10的学习：机器学习入门

明天我们将学习机器学习入门，这是数据分析的高级技能。