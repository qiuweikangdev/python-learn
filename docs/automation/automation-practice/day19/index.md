# Day 19: 脚本自动化实战

## 学习目标

完成今天的学习后，你将能够：
- 实现文件批量处理自动化
- 进行Excel/Word/PDF办公文档处理
- 编写邮件自动化脚本
- 配置定时任务调度

## 技术原理

### 自动化场景

```
手动重复操作 → 脚本自动化 → 定时执行 → 完全自动化
```

### 常用库

| 库 | 用途 |
|---|------|
| openpyxl | Excel处理 |
| python-docx | Word处理 |
| PyPDF2/reportlab | PDF处理 |
| schedule | 定时任务 |
| smtplib | 邮件发送 |

## 代码案例

### 案例1：批量文件处理器

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量文件处理器
功能：实现文件批量重命名、格式转换、压缩等操作
"""

import os
import shutil
import glob
from pathlib import Path
from datetime import datetime
from typing import List, Callable
import zipfile


class BatchFileProcessor:
    """批量文件处理器"""
    
    def __init__(self, source_dir: str):
        self.source_dir = Path(source_dir)
        self.processed_files: List[str] = []
    
    def batch_rename(self, pattern: str, replacement: str, 
                    file_filter: str = "*") -> List[str]:
        """批量重命名文件"""
        renamed_files = []
        
        for file_path in self.source_dir.glob(file_filter):
            if file_path.is_file():
                new_name = file_path.name.replace(pattern, replacement)
                new_path = file_path.parent / new_name
                
                file_path.rename(new_path)
                renamed_files.append(str(new_path))
                self.processed_files.append(str(new_path))
        
        print(f"重命名完成: {len(renamed_files)} 个文件")
        return renamed_files
    
    def batch_convert_format(self, source_ext: str, target_ext: str,
                           converter: Callable = None) -> List[str]:
        """批量转换格式"""
        converted_files = []
        
        for file_path in self.source_dir.glob(f"*.{source_ext}"):
            if file_path.is_file():
                new_path = file_path.with_suffix(f".{target_ext}")
                
                if converter:
                    converter(str(file_path), str(new_path))
                else:
                    # 默认复制
                    shutil.copy2(file_path, new_path)
                
                converted_files.append(str(new_path))
                self.processed_files.append(str(new_path))
        
        print(f"格式转换完成: {len(converted_files)} 个文件")
        return converted_files
    
    def batch_compress(self, output_file: str, 
                      file_filter: str = "*") -> str:
        """批量压缩文件"""
        with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in self.source_dir.glob(file_filter):
                if file_path.is_file():
                    arcname = file_path.name
                    zipf.write(file_path, arcname)
                    self.processed_files.append(str(file_path))
        
        print(f"压缩完成: {output_file}")
        return output_file
    
    def batch_move(self, target_dir: str, 
                  file_filter: str = "*") -> List[str]:
        """批量移动文件"""
        target_path = Path(target_dir)
        target_path.mkdir(parents=True, exist_ok=True)
        
        moved_files = []
        for file_path in self.source_dir.glob(file_filter):
            if file_path.is_file():
                new_path = target_path / file_path.name
                shutil.move(str(file_path), str(new_path))
                moved_files.append(str(new_path))
                self.processed_files.append(str(new_path))
        
        print(f"移动完成: {len(moved_files)} 个文件")
        return moved_files
    
    def batch_organize_by_extension(self) -> dict:
        """按扩展名整理文件"""
        organized = {}
        
        for file_path in self.source_dir.iterdir():
            if file_path.is_file():
                ext = file_path.suffix.lstrip('.').lower() or 'no_extension'
                
                # 创建子目录
                sub_dir = self.source_dir / ext
                sub_dir.mkdir(exist_ok=True)
                
                # 移动文件
                new_path = sub_dir / file_path.name
                shutil.move(str(file_path), str(new_path))
                
                if ext not in organized:
                    organized[ext] = []
                organized[ext].append(str(new_path))
        
        print(f"整理完成: {len(organized)} 个分类")
        return organized
    
    def batch_rename_with_pattern(self, prefix: str = "", 
                                 suffix: str = "",
                                 date_format: bool = True) -> List[str]:
        """按模式重命名文件"""
        renamed_files = []
        
        for index, file_path in enumerate(sorted(self.source_dir.glob("*")), 1):
            if file_path.is_file():
                # 构建新文件名
                new_name = ""
                if prefix:
                    new_name += f"{prefix}_"
                
                if date_format:
                    new_name += datetime.now().strftime("%Y%m%d_%H%M%S_")
                
                new_name += f"{index:04d}"
                
                if suffix:
                    new_name += f"_{suffix}"
                
                new_name += file_path.suffix
                new_path = file_path.parent / new_name
                
                file_path.rename(new_path)
                renamed_files.append(str(new_path))
        
        print(f"模式重命名完成: {len(renamed_files)} 个文件")
        return renamed_files
    
    def get_statistics(self) -> dict:
        """获取处理统计"""
        total_size = 0
        file_types = {}
        
        for file_path in self.source_dir.rglob("*"):
            if file_path.is_file():
                total_size += file_path.stat().st_size
                ext = file_path.suffix.lower() or 'no_extension'
                file_types[ext] = file_types.get(ext, 0) + 1
        
        return {
            'total_files': len(list(self.source_dir.rglob("*"))),
            'total_size': f"{total_size / 1024 / 1024:.2f} MB",
            'file_types': file_types,
            'processed_count': len(self.processed_files)
        }


# 使用示例
def demo_batch_processing():
    """演示批量处理"""
    # 创建临时目录用于演示
    import tempfile
    
    with tempfile.TemporaryDirectory() as tmpdir:
        # 创建测试文件
        for i in range(5):
            file_path = Path(tmpdir) / f"test_file_{i}.txt"
            file_path.write_text(f"测试内容 {i}")
        
        print("=== 原始文件 ===")
        for f in Path(tmpdir).glob("*"):
            print(f"  {f.name}")
        
        # 批量重命名
        processor = BatchFileProcessor(tmpdir)
        processor.batch_rename("test_", "demo_")
        
        print("\n=== 重命名后 ===")
        for f in Path(tmpdir).glob("*"):
            print(f"  {f.name}")
        
        # 打印统计
        stats = processor.get_statistics()
        print(f"\n=== 统计信息 ===")
        print(f"文件总数: {stats['total_files']}")
        print(f"已处理: {stats['processed_count']}")


if __name__ == "__main__":
    demo_batch_processing()
```

### 案例2：Excel 数据处理

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Excel数据处理
功能：使用openpyxl处理Excel文件
"""

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.chart import BarChart, Reference
from openpyxl.utils import get_column_letter
from typing import List, Dict, Optional
from pathlib import Path


class ExcelProcessor:
    """Excel处理器"""
    
    def __init__(self):
        self.workbook = None
        self.worksheet = None
    
    def create_workbook(self):
        """创建工作簿"""
        self.workbook = openpyxl.Workbook()
        self.worksheet = self.workbook.active
        return self
    
    def load_workbook(self, file_path: str):
        """加载工作簿"""
        self.workbook = openpyxl.load_workbook(file_path)
        self.worksheet = self.workbook.active
        return self
    
    def write_headers(self, headers: List[str]):
        """写入表头"""
        for col, header in enumerate(headers, 1):
            cell = self.worksheet.cell(row=1, column=col, value=header)
            cell.font = Font(bold=True)
            cell.fill = PatternFill(start_color="CCCCCC", end_color="CCCCCC", fill_type="solid")
            cell.alignment = Alignment(horizontal="center")
        return self
    
    def write_data(self, data: List[List], start_row: int = 2):
        """写入数据"""
        for row_idx, row_data in enumerate(data, start_row):
            for col_idx, value in enumerate(row_data, 1):
                self.worksheet.cell(row=row_idx, column=col_idx, value=value)
        return self
    
    def write_dict_data(self, data: List[Dict], headers: Optional[List[str]] = None):
        """写入字典数据"""
        if not data:
            return self
        
        if headers is None:
            headers = list(data[0].keys())
        
        self.write_headers(headers)
        
        for row_idx, row_data in enumerate(data, 2):
            for col_idx, header in enumerate(headers, 1):
                value = row_data.get(header, "")
                self.worksheet.cell(row=row_idx, column=col_idx, value=value)
        
        return self
    
    def auto_adjust_columns(self):
        """自动调整列宽"""
        for column in self.worksheet.columns:
            max_length = 0
            column_letter = get_column_letter(column[0].column)
            
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            
            adjusted_width = min(max_length + 2, 50)
            self.worksheet.column_dimensions[column_letter].width = adjusted_width
        
        return self
    
    def add_chart(self, title: str, data_range: str, chart_type: str = "bar"):
        """添加图表"""
        chart = BarChart()
        chart.title = title
        chart.style = 10
        chart.y_axis.title = '数值'
        chart.x_axis.title = '类别'
        
        data = Reference(self.worksheet, range_string=data_range)
        chart.add_data(data, titles_from_data=True)
        
        self.worksheet.add_chart(chart, "F1")
        return self
    
    def save(self, file_path: str):
        """保存工作簿"""
        self.workbook.save(file_path)
        print(f"文件已保存: {file_path}")
        return self
    
    def read_data(self) -> List[Dict]:
        """读取数据"""
        data = []
        headers = []
        
        # 读取表头
        for cell in self.worksheet[1]:
            headers.append(cell.value)
        
        # 读取数据
        for row in self.worksheet.iter_rows(min_row=2, values_only=True):
            row_dict = dict(zip(headers, row))
            data.append(row_dict)
        
        return data


class SalesReportGenerator:
    """销售报告生成器"""
    
    def __init__(self):
        self.processor = ExcelProcessor()
    
    def generate_report(self, sales_data: List[Dict], output_file: str):
        """生成销售报告"""
        self.processor.create_workbook()
        
        # 写入销售数据
        self.processor.write_dict_data(sales_data)
        
        # 自动调整列宽
        self.processor.auto_adjust_columns()
        
        # 添加汇总行
        summary_row = len(sales_data) + 2
        self.processor.worksheet.cell(row=summary_row, column=1, value="总计")
        self.processor.worksheet.cell(row=summary_row, column=3, 
                                      value=f"=SUM(C2:C{summary_row-1})")
        
        # 保存文件
        self.processor.save(output_file)
    
    def generate_monthly_report(self, monthly_data: Dict[str, float], 
                               output_file: str):
        """生成月度报告"""
        self.processor.create_workbook()
        
        # 准备数据
        headers = ["月份", "销售额"]
        data = [[month, amount] for month, amount in monthly_data.items()]
        
        self.processor.write_headers(headers)
        self.processor.write_data(data)
        self.processor.auto_adjust_columns()
        
        # 添加图表
        self.processor.add_chart("月度销售趋势", f"A1:B{len(data)+1}")
        
        self.processor.save(output_file)


# 使用示例
def demo_excel_processing():
    """演示Excel处理"""
    import tempfile
    
    with tempfile.TemporaryDirectory() as tmpdir:
        # 创建示例销售数据
        sales_data = [
            {"产品": "产品A", "数量": 100, "单价": 50, "销售额": 5000},
            {"产品": "产品B", "数量": 80, "单价": 80, "销售额": 6400},
            {"产品": "产品C", "数量": 120, "单价": 30, "销售额": 3600},
            {"产品": "产品D", "数量": 60, "单价": 100, "销售额": 6000},
            {"产品": "产品E", "数量": 90, "单价": 45, "销售额": 4050},
        ]
        
        # 生成报告
        generator = SalesReportGenerator()
        output_file = Path(tmpdir) / "sales_report.xlsx"
        generator.generate_report(sales_data, str(output_file))
        
        # 读取验证
        processor = ExcelProcessor()
        processor.load_workbook(str(output_file))
        data = processor.read_data()
        
        print("=== 生成的销售报告 ===")
        for row in data:
            print(row)


if __name__ == "__main__":
    demo_excel_processing()
```

### 案例3：PDF 处理

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF处理
功能：使用PyPDF2和reportlab处理PDF文件
"""

from PyPDF2 import PdfReader, PdfWriter, PdfMerger
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pathlib import Path
from typing import List
import tempfile


class PDFProcessor:
    """PDF处理器"""
    
    def __init__(self):
        self.reader = None
        self.writer = PdfWriter()
    
    def read_pdf(self, file_path: str):
        """读取PDF"""
        self.reader = PdfReader(file_path)
        return self
    
    def get_page_count(self) -> int:
        """获取页数"""
        if self.reader:
            return len(self.reader.pages)
        return 0
    
    def extract_text(self, page_number: int = 0) -> str:
        """提取文本"""
        if self.reader and page_number < len(self.reader.pages):
            return self.reader.pages[page_number].extract_text()
        return ""
    
    def extract_all_text(self) -> List[str]:
        """提取所有页面文本"""
        texts = []
        if self.reader:
            for page in self.reader.pages:
                texts.append(page.extract_text())
        return texts
    
    def merge_pdfs(self, pdf_files: List[str], output_file: str):
        """合并PDF"""
        merger = PdfMerger()
        
        for pdf_file in pdf_files:
            merger.append(pdf_file)
        
        merger.write(output_file)
        merger.close()
        print(f"PDF合并完成: {output_file}")
    
    def split_pdf(self, input_file: str, output_dir: str):
        """拆分PDF"""
        reader = PdfReader(input_file)
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        for page_num, page in enumerate(reader.pages):
            writer = PdfWriter()
            writer.add_page(page)
            
            output_file = output_path / f"page_{page_num + 1}.pdf"
            with open(output_file, "wb") as f:
                writer.write(f)
        
        print(f"PDF拆分完成: {len(reader.pages)} 页")
    
    def rotate_page(self, page_number: int, angle: int):
        """旋转页面"""
        if self.reader:
            page = self.reader.pages[page_number]
            page.rotate(angle)
            self.writer.add_page(page)
    
    def add_page(self, page):
        """添加页面"""
        self.writer.add_page(page)
    
    def save(self, output_file: str):
        """保存PDF"""
        with open(output_file, "wb") as f:
            self.writer.write(f)
        print(f"PDF保存完成: {output_file}")


class PDFGenerator:
    """PDF生成器"""
    
    def __init__(self, output_file: str):
        self.output_file = output_file
        self.c = canvas.Canvas(output_file, pagesize=A4)
        self.width, self.height = A4
    
    def add_title(self, title: str, y: float = None):
        """添加标题"""
        if y is None:
            y = self.height - 1 * inch
        
        self.c.setFont("Helvetica-Bold", 24)
        self.c.drawString(1 * inch, y, title)
        return self
    
    def add_text(self, text: str, x: float = 1 * inch, y: float = None,
                font_size: int = 12):
        """添加文本"""
        if y is None:
            y = self.height - 2 * inch
        
        self.c.setFont("Helvetica", font_size)
        self.c.drawString(x, y, text)
        return self
    
    def add_paragraph(self, text: str, x: float = 1 * inch, y: float = None,
                     max_width: float = None):
        """添加段落"""
        if y is None:
            y = self.height - 2.5 * inch
        if max_width is None:
            max_width = self.width - 2 * inch
        
        self.c.setFont("Helvetica", 12)
        
        # 简单换行处理
        lines = []
        current_line = ""
        
        for word in text.split():
            test_line = f"{current_line} {word}".strip()
            if self.c.stringWidth(test_line, "Helvetica", 12) < max_width:
                current_line = test_line
            else:
                lines.append(current_line)
                current_line = word
        lines.append(current_line)
        
        for line in lines:
            self.c.drawString(x, y, line)
            y -= 14  # 行距
        
        return self
    
    def add_image(self, image_path: str, x: float = 1 * inch, y: float = None,
                 width: float = None, height: float = None):
        """添加图片"""
        if y is None:
            y = self.height - 4 * inch
        
        if width and height:
            self.c.drawImage(image_path, x, y, width, height)
        elif width:
            self.c.drawImage(image_path, x, y, width=width)
        elif height:
            self.c.drawImage(image_path, x, y, height=height)
        else:
            self.c.drawImage(image_path, x, y)
        
        return self
    
    def add_line(self, x1: float, y1: float, x2: float, y2: float):
        """添加线条"""
        self.c.line(x1, y1, x2, y2)
        return self
    
    def new_page(self):
        """新页面"""
        self.c.showPage()
        return self
    
    def save(self):
        """保存PDF"""
        self.c.save()
        print(f"PDF生成完成: {self.output_file}")


def demo_pdf_processing():
    """演示PDF处理"""
    with tempfile.TemporaryDirectory() as tmpdir:
        # 生成PDF
        generator = PDFGenerator(f"{tmpdir}/document.pdf")
        generator.add_title("自动化测试报告")
        generator.add_text("测试日期: 2024-01-15")
        generator.add_paragraph(
            "这是一份自动生成的测试报告。包含测试结果、性能指标和建议。"
        )
        generator.new_page()
        generator.add_title("第二页")
        generator.add_text("更多内容...")
        generator.save()
        
        # 读取PDF
        processor = PDFProcessor()
        processor.read_pdf(f"{tmpdir}/document.pdf")
        
        print(f"PDF页数: {processor.get_page_count()}")
        print(f"第一页文本: {processor.extract_text(0)[:50]}...")


if __name__ == "__main__":
    demo_pdf_processing()
```

### 案例4：邮件自动化

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
邮件自动化
功能：实现邮件发送和处理自动化
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Optional
from pathlib import Path
from datetime import datetime


class EmailSender:
    """邮件发送器"""
    
    def __init__(self, smtp_host: str, smtp_port: int, 
                 username: str, password: str, use_tls: bool = True):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.username = username
        self.password = password
        self.use_tls = use_tls
    
    def send_email(self, to_addrs: List[str], subject: str, 
                  body: str, html: bool = False,
                  attachments: Optional[List[str]] = None) -> bool:
        """发送邮件"""
        try:
            # 创建邮件
            msg = MIMEMultipart()
            msg['From'] = self.username
            msg['To'] = ', '.join(to_addrs)
            msg['Subject'] = subject
            
            # 添加正文
            content_type = 'html' if html else 'plain'
            msg.attach(MIMEText(body, content_type, 'utf-8'))
            
            # 添加附件
            if attachments:
                for file_path in attachments:
                    self._attach_file(msg, file_path)
            
            # 发送邮件
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)
            
            print(f"邮件发送成功: {subject}")
            return True
            
        except Exception as e:
            print(f"邮件发送失败: {e}")
            return False
    
    def _attach_file(self, msg: MIMEMultipart, file_path: str):
        """添加附件"""
        file_path = Path(file_path)
        
        with open(file_path, "rb") as f:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(f.read())
        
        encoders.encode_base64(part)
        part.add_header(
            'Content-Disposition',
            f'attachment; filename="{file_path.name}"'
        )
        msg.attach(part)


class ReportEmailSender:
    """报告邮件发送器"""
    
    def __init__(self, email_sender: EmailSender):
        self.sender = email_sender
    
    def send_test_report(self, recipients: List[str], 
                        report_data: dict, report_file: str):
        """发送测试报告"""
        subject = f"自动化测试报告 - {datetime.now().strftime('%Y-%m-%d')}"
        
        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .header {{ background-color: #4CAF50; color: white; padding: 20px; }}
                .content {{ padding: 20px; }}
                .summary {{ background-color: #f5f5f5; padding: 15px; margin: 10px 0; }}
                .passed {{ color: green; font-weight: bold; }}
                .failed {{ color: red; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>自动化测试报告</h1>
                <p>生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            </div>
            <div class="content">
                <div class="summary">
                    <h2>测试摘要</h2>
                    <p>总用例数: <strong>{report_data.get('total', 0)}</strong></p>
                    <p>通过: <span class="passed">{report_data.get('passed', 0)}</span></p>
                    <p>失败: <span class="failed">{report_data.get('failed', 0)}</span></p>
                    <p>通过率: <strong>{report_data.get('pass_rate', '0%')}</strong></p>
                </div>
                <p>详细报告请查看附件。</p>
            </div>
        </body>
        </html>
        """
        
        self.sender.send_email(
            to_addrs=recipients,
            subject=subject,
            body=html_body,
            html=True,
            attachments=[report_file] if report_file else None
        )
    
    def send_daily_summary(self, recipients: List[str], 
                          summary_data: dict):
        """发送每日摘要"""
        subject = f"每日自动化任务摘要 - {datetime.now().strftime('%Y-%m-%d')}"
        
        body = f"""
每日任务执行摘要
================

执行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

任务统计:
- 文件处理: {summary_data.get('files_processed', 0)} 个
- 测试执行: {summary_data.get('tests_run', 0)} 个
- 邮件发送: {summary_data.get('emails_sent', 0)} 封

系统状态: 正常运行
"""
        
        self.sender.send_email(
            to_addrs=recipients,
            subject=subject,
            body=body
        )


def demo_email_automation():
    """演示邮件自动化"""
    print("=== 邮件自动化演示 ===")
    print("注意: 需要配置真实的SMTP服务器信息才能发送邮件")
    
    # 示例配置（需要替换为真实配置）
    # sender = EmailSender(
    #     smtp_host="smtp.gmail.com",
    #     smtp_port=587,
    #     username="your_email@gmail.com",
    #     password="your_app_password"
    # )
    
    # 模拟发送
    print("\n模拟发送测试报告邮件...")
    report_data = {
        'total': 100,
        'passed': 95,
        'failed': 5,
        'pass_rate': '95%'
    }
    
    print(f"收件人: team@example.com")
    print(f"主题: 自动化测试报告 - {datetime.now().strftime('%Y-%m-%d')}")
    print(f"报告数据: {report_data}")


if __name__ == "__main__":
    demo_email_automation()
```

## 课后练习

### 练习1：文件批处理
1. 实现按日期整理文件的脚本
2. 批量转换图片格式
3. 实现文件去重功能

### 练习2：办公自动化
1. 生成销售报表Excel
2. 从PDF提取数据
3. 自动填充Word模板

### 练习3：邮件自动化
1. 实现定时发送报告
2. 添加邮件模板功能
3. 实现邮件列表管理

## 常见问题

### Q1: 如何处理大文件？
A: 使用流式处理，分块读取，避免内存溢出。

### Q2: 如何处理中文编码？
A: 使用UTF-8编码，正确设置文件读写编码。

### Q3: 如何保护邮箱密码？
A: 使用环境变量或配置文件，不要硬编码密码。

## 下一步学习

完成今天的学习后，建议你：
1. 为自己的工作流程编写自动化脚本
2. 整合多个自动化任务
3. 准备进入Day 20的学习：企业级自动化测试实战

明天我们将学习如何构建企业级的自动化测试项目。
