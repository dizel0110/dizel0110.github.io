#!/usr/bin/env python3
"""
V-AFE Shared Docs Sync
Синхронизирует файлы с префиксом _ из vortex-afe во все 3 репо
"""

import shutil
from pathlib import Path
import sys

# Пути к репозиториям
REPOS = {
    'vortex-afe': Path('d:/ai/vortex-afe'),
    'vafe-api': Path('d:/ai/vafe-api'),
    'dizel0110.github.io': Path('d:/ai/dizel0110.github.io'),
}

# Общие файлы с префиксом _
SHARED_FILES = [
    '_ECOSYSTEM_CONTEXT.md',
    '_JOURNAL.md',
    '_QUICK_START.md',
    '_CORS_FIX_INSTRUCTION.md',      # Инструкция для vafe-api (CORS)
    '_VAFE_API_README.md',            # README для vafe-api
    '_CROSS_REPO_WORKFLOW.md',        # Workflow для всех репо
    '_VAFE_API_SOURCES_INSTRUCTION.md',  # Инструкция: источники из интернета
]

# Источник истины
SOURCE_DIR = REPOS['vortex-afe'] / '.internal'


def sync_file(filename: str, dry_run: bool = False) -> bool:
    """Синхронизация одного файла во все репо"""
    source = SOURCE_DIR / filename
    if not source.exists():
        print(f"  ⚠️  Файл не найден: {source}")
        return False

    success = True
    for repo_name, repo_path in REPOS.items():
        dest_dir = repo_path / '.internal'
        dest = dest_dir / filename

        # Пропускаем источник (vortex-afe)
        if repo_name == 'vortex-afe':
            continue

        if not dest_dir.exists():
            print(f"  ⚠️  Папка не найдена: {dest_dir}")
            success = False
            continue

        if dry_run:
            print(f"  📄 {filename} → {repo_name}/.internal/")
        else:
            try:
                shutil.copy2(source, dest)
                print(f"  ✅ {filename} → {repo_name}/.internal/")
            except Exception as e:
                print(f"  ❌ Ошибка: {e}")
                success = False

    return success


def sync_all(dry_run: bool = False):
    """Синхронизация всех общих файлов"""
    print("=" * 60)
    print("V-AFE Shared Docs Sync")
    print("=" * 60)
    print(f"\nИсточник: {SOURCE_DIR}")
    print(f"Цели: {list(REPOS.keys())}")
    print(f"Файлы: {SHARED_FILES}")
    print()
    
    if dry_run:
        print("🔍 Dry run (без копирования):\n")
    else:
        print("🚀 Синхронизация:\n")
    
    total = 0
    synced = 0
    
    for filename in SHARED_FILES:
        total += 1
        if sync_file(filename, dry_run):
            synced += 1
    
    print()
    print("=" * 60)
    if dry_run:
        print(f"Будет синхронизировано: {synced}/{total} файлов")
    else:
        print(f"Синхронизировано: {synced}/{total} файлов")
    print("=" * 60)
    
    return synced == total


def main():
    """Main entry point"""
    dry_run = '--dry-run' in sys.argv or '-n' in sys.argv
    help_requested = '--help' in sys.argv or '-h' in sys.argv
    
    if help_requested:
        print("""
V-AFE Shared Docs Sync

Синхронизирует файлы с префиксом _ из vortex-afe во все 3 репо.

Использование:
    python _sync.py          # Синхронизировать все файлы
    python _sync.py --dry-run # Показать что будет (без копирования)
    python _sync.py --help    # Показать эту справку

Пример:
    # Перед коммитом общих файлов:
    cd d:\\ai\\vortex-afe\\.internal
    python _sync.py
    
    # Проверить что будет:
    python _sync.py --dry-run
""")
        return 0
    
    if sync_all(dry_run=dry_run):
        if not dry_run:
            print("\n✅ Синхронизация завершена успешно!")
            print("\n📝 Следующие шаги:")
            print("   Закоммить изменения в каждом репо:")
            print("      cd d:\\ai\\vortex-afe && git add .internal && git commit -m 'Sync shared docs' && git push")
            print("      cd d:\\ai\\vafe-api && git add .internal && git commit -m 'Sync shared docs' && git push")
            print("      cd d:\\ai\\dizel0110.github.io && git add .internal && git commit -m 'Sync shared docs' && git push")
        return 0
    else:
        print("\n❌ Синхронизация завершена с ошибками!")
        return 1


if __name__ == '__main__':
    sys.exit(main())
